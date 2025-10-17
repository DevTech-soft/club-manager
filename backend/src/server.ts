
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import type { Player, Team, Attendance, ClubSettings, PlayerCreationData, CoachCreationData, TournamentCreationData } from './types';
import { Prisma } from '@prisma/client';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// --- ENUM MAPPINGS ---
// To handle discrepancies between frontend display values and Prisma enum keys.

const subCategoryToPrisma: { [key: string]: 'Basico' | 'Intermedio' | 'Avanzado' } = {
    'Básico': 'Basico',
    'Intermedio': 'Intermedio',
    'Avanzado': 'Avanzado',
};
const subCategoryFromPrisma: { [key: string]: string } = {
    'Basico': 'Básico',
    'Intermedio': 'Intermedio',
    'Avanzado': 'Avanzado',
};

const positionToPrisma: { [key: string]: 'Setter' | 'Libero' | 'MiddleBlocker' | 'OutsideHitter' | 'OppositeHitter' } = {
    'Colocador': 'Setter',
    'Líbero': 'Libero',
    'Central': 'MiddleBlocker',
    'Punta Receptor': 'OutsideHitter',
    'Opuesto': 'OppositeHitter',
};
const positionFromPrisma: { [key: string]: string } = {
    'Setter': 'Colocador',
    'Libero': 'Líbero',
    'MiddleBlocker': 'Central',
    'OutsideHitter': 'Punta Receptor',
    'OppositeHitter': 'Opuesto',
};
// MainCategory enum values match Prisma keys, so no mapping is needed.

// --- HELPER FUNCTIONS FOR DATA MAPPING ---

const mapPlayerForFrontend = (player: any): Player => {
    if (!player) return player;
    const { birthDate, joinDate, lastPaymentDate, statsHistory, ...rest } = player;
    return {
        ...rest,
        birthDate: birthDate.toISOString().split('T')[0],
        joinDate: joinDate.toISOString(),
        lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : undefined,
        statsHistory: statsHistory.map((sh: any) => ({ ...sh, stats: sh.stats as any, date: sh.date.toISOString() })),
        subCategory: subCategoryFromPrisma[player.subCategory] || player.subCategory,
        position: positionFromPrisma[player.position] || player.position,
    };
};

const mapTeamForFrontend = (team: any) => {
    if (!team) return team;
    const { players, ...teamData } = team;
    return {
        ...teamData,
        playerIds: players.map((p: { id: string }) => p.id),
        subCategory: subCategoryFromPrisma[teamData.subCategory] || teamData.subCategory,
    };
};

const MapTournamentTeamsForFrontend = (tournamentTeam: any) => {
    if (!tournamentTeam) return tournamentTeam;

    const { team, ...teamEntryData } = tournamentTeam;
    const players = team?.players || [];

    return {
        ...teamEntryData,
        ...team,
        playerIds: players.map((p: { id: string }) => p.id),
        subCategory: subCategoryFromPrisma[team?.subCategory] || team?.subCategory,
    };
};



// Root endpoint
app.get('/api', (req: Request, res: Response) => {
    res.send('Volleyball Club Manager API is running!');
});

// AUTH
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { user, pass } = req.body;
        if (user === 'admin' && pass === 'password') {
            return res.json({ success: true, userType: 'admin' });
        }
        if (user === 'superadmin' && pass === 'superpassword') {
            return res.json({ success: true, userType: 'superAdmin' });
        }

        const coach = await prisma.coach.findUnique({
            where: { document: user }
        });

        if (coach && coach.password === pass) {
            const { password, ...coachInfo } = coach;
            return res.json({ success: true, userType: 'coach', coachInfo });
        }

        return res.status(401).json({ success: false, userType: null, message: 'Invalid credentials' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, userType: null, message: 'Internal server error' });
    }
});


// PLAYERS
app.get('/api/players', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await prisma.player.findMany({
            include: { statsHistory: { orderBy: { date: 'desc' } } },
            orderBy: { joinDate: 'desc' },
        });
        res.json(players.map(mapPlayerForFrontend));
    } catch (error) {
        next(error);
    }
});

app.get('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: req.params.id },
            include: { statsHistory: { orderBy: { date: 'desc' } } },
        });
        if (player) {
            res.json(mapPlayerForFrontend(player));
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/players', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { statsHistory, ...playerData } = req.body as PlayerCreationData;

        const mappedSubCategory = subCategoryToPrisma[playerData.subCategory];
        const mappedPosition = positionToPrisma[playerData.position];

        if (!mappedSubCategory || !mappedPosition) {
            return res.status(400).json({ message: 'Invalid subCategory or position value provided.' });
        }

        const newPlayer = await prisma.player.create({
            data: {
                ...playerData,
                birthDate: new Date(playerData.birthDate),
                mainCategories: playerData.mainCategories as any, // Values match keys
                subCategory: mappedSubCategory,
                position: mappedPosition,
                statsHistory: {
                    create: statsHistory.map(sh => ({ stats: sh.stats as any, date: new Date(sh.date) }))
                }
            },
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.status(201).json(mapPlayerForFrontend(newPlayer));
    } catch (error) {
        next(error);
    }
});

app.put('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { statsHistory, joinDate, ...playerData } = req.body as Player;

        const mappedSubCategory = subCategoryToPrisma[playerData.subCategory];
        const mappedPosition = positionToPrisma[playerData.position];

        if (!mappedSubCategory || !mappedPosition) {
            return res.status(400).json({ message: 'Invalid subCategory or position value provided.' });
        }

        const dataToUpdate: any = {
            ...playerData,
            id: undefined, // Do not try to update id
            birthDate: new Date(playerData.birthDate),
            lastPaymentDate: playerData.lastPaymentDate ? new Date(playerData.lastPaymentDate) : null,
            mainCategories: playerData.mainCategories as any,
            subCategory: mappedSubCategory,
            position: mappedPosition,
        };

        if (statsHistory && statsHistory.length > 0) {
            const latestStatRecord = statsHistory[0];
            if (latestStatRecord.id) {
                dataToUpdate.statsHistory = {
                    update: {
                        where: { id: latestStatRecord.id },
                        data: { stats: latestStatRecord.stats as any }
                    }
                };
            }
        }

        const updatedPlayer = await prisma.player.update({
            where: { id },
            data: dataToUpdate,
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.json(mapPlayerForFrontend(updatedPlayer));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.player.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

app.get('/api/players/document/:document', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const player = await prisma.player.findUnique({
            where: { document: req.params.document },
            include: { statsHistory: { orderBy: { date: 'desc' } } },
        });
        if (player) {
            res.json(mapPlayerForFrontend(player));
        } else {
            res.status(404).json({ message: 'Jugador no encontrado' });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/players/:id/payment', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedPlayer = await prisma.player.update({
            where: { id: req.params.id },
            data: { lastPaymentDate: new Date() },
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.json(mapPlayerForFrontend(updatedPlayer));
    } catch (error) {
        next(error);
    }
});


// TEAMS
app.get('/api/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                players: {
                    select: { id: true }
                }
            }
        });
        res.json(teams.map(mapTeamForFrontend));
    } catch (error) {
        next(error);
    }
});

app.post('/api/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerIds, coachId, ...teamData } = req.body as Omit<Team, 'id' | 'coach'>;

        const mappedSubCategory = subCategoryToPrisma[teamData.subCategory];
        if (!mappedSubCategory) {
            return res.status(400).json({ message: 'Invalid subCategory value provided.' });
        }

        const newTeam = await prisma.team.create({
            data: {
                ...teamData,
                mainCategory: teamData.mainCategory as any,
                subCategory: mappedSubCategory,
                players: {
                    connect: playerIds.map(id => ({ id }))
                },
                coach: coachId ? { connect: { id: coachId } } : undefined,
            },
            include: {
                players: { select: { id: true } },
                coach: { select: { firstName: true, lastName: true } }
            }
        });
        res.status(201).json(mapTeamForFrontend(newTeam));
    } catch (error) {
        next(error);
    }
});

app.put('/api/teams/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { playerIds, mainCategory, subCategory, ...teamData } = req.body as Team;

        // Team category is not meant to be updated, only members and tournament info
        const updatedTeam = await prisma.team.update({
            where: { id },
            data: {
                name: teamData.name,
                tournament: teamData.tournament,
                tournamentPosition: teamData.tournamentPosition,
                players: {
                    set: playerIds.map(pid => ({ id: pid }))
                }
            },
            include: { players: { select: { id: true } } }
        });
        res.json(mapTeamForFrontend(updatedTeam));
    } catch (error) {
        next(error);
    }
});

// TEAMS BY PLAYER
app.get('/api/players/:id/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teams = await prisma.team.findMany({
            where: {
                players: {
                    some: {
                        id: id
                    }
                }
            },
            include: {
                players: {
                    select: { id: true }
                }
            }
        });
        res.json(teams.map(mapTeamForFrontend));
    } catch (error) {
        next(error);
    }
});

// ATTENDANCE
app.get('/api/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const attendances = await prisma.attendance.findMany();
        // Format date to YYYY-MM-DD string for frontend compatibility
        const formattedAttendances = attendances.map((a: { date: { toISOString: () => string; }; }) => ({
            ...a,
            date: a.date.toISOString().split('T')[0]
        }));
        res.json(formattedAttendances);
    } catch (error) {
        next(error);
    }
});

app.post('/api/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerId, status } = req.body as Pick<Attendance, 'playerId' | 'status'>;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newRecord = await prisma.attendance.upsert({
            where: {
                playerId_date: {
                    playerId,
                    date: today
                }
            },
            update: { status: status as any },
            create: {
                playerId,
                status: status as any,
                date: today,
            }
        });
        res.status(201).json({ ...newRecord, date: newRecord.date.toISOString().split('T')[0] });
    } catch (error) {
        next(error);
    }
});
// Get attendances for a specific player
app.get('/api/players/:id/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const attendances = await prisma.attendance.findMany({
            where: { playerId: id },
            orderBy: { date: 'desc' }
        });
        const formattedAttendances = attendances.map(a => ({
            ...a,
            date: a.date.toISOString().split('T')[0]
        }));
        res.json(formattedAttendances);
    } catch (error) {
        next(error);
    }
});

// COACHES
app.get('/api/coaches', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coaches = await prisma.coach.findMany({
            select: { id: true, firstName: true, lastName: true, document: true, avatarUrl: true }
        });
        res.json(coaches);
    } catch (error) {
        next(error);
    }
});

app.post('/api/coaches', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coachData = req.body as CoachCreationData;
        const newCoach = await prisma.coach.create({
            data: {
                ...coachData,
                password: coachData.document, // Set password to document by default
            }
        });
        const { password, ...coachInfo } = newCoach;
        res.status(201).json(coachInfo);
    } catch (error) {
        next(error);
    }
});

// TOURNAMENTS
app.get('/api/tournaments', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tournaments = await prisma.tournament.findMany({
            include: {
                registeredTeams: {
                    include: {
                        team: {
                            include: {
                                players: { select: { id: true } },
                                coach: { select: { firstName: true, lastName: true } }
                            }
                        }

                    }
                }
            },
            orderBy: { startDate: "desc" }
        });

        const formattedTournaments = tournaments.map(t => ({
            ...t,
            startDate: t.startDate.toISOString().split('T')[0],
            endDate: t.endDate.toISOString().split('T')[0],
            registrationDeadline: t.registrationDeadline.toISOString().split('T')[0],
            registeredTeams: t.registeredTeams?.map(rt => MapTournamentTeamsForFrontend(rt)) || [],
        }));
        res.json(formattedTournaments);
    } catch (error) {
        next(error);
    }
});

app.post("/api/tournaments", async (req, res, next) => {
    try {
        const { id, type, quickTeamNames, registeredTeams, ...data } = req.body;

        // Si hay equipos registrados, obtener sus nombres primero
        let teamRegistrations = undefined;
        if (type === "STANDARD" && registeredTeams && registeredTeams.length > 0) {
            const teams = await prisma.tournamentTeam.findMany({
                where: { id: { in: registeredTeams } }
            });

            teamRegistrations = {
                create: registeredTeams.map((teamId: string) => {
                    const team = teams.find(t => t.id === teamId);
                    return {
                        teamName: team?.teamName || "Equipo desconocido",
                        isExternal: false,
                        externalClub: team?.externalClub || "Sin club",
                        team: { connect: { id: teamId } }
                    };
                })
            };
        }

        const tournament = await prisma.tournament.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                registrationDeadline: new Date(data.registrationDeadline),
                type,
                quickTeamNames: quickTeamNames || [],
                registeredTeams: teamRegistrations
            },
            include: {
                registeredTeams: {
                    include: {
                        team: {
                            include: {
                                players: { select: { id: true } },
                                coach: { select: { firstName: true, lastName: true } },
                                tournamentEntries: { select: { id: true } }
                            }
                        },
                        // tournament: { select: { id: true } }
                    }
                }
            }
        });
        console.log("Torneo creado:", tournament);
        res.status(201).json(tournament);
    } catch (error) {
        next(error);
    }
});

app.get("/api/tournaments/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                // groups: { include: { matches: true  } },
                registeredTeams: {
                    include: {
                        team: {
                            include: {
                                players: { select: { id: true } },
                                coach: { select: { firstName: true, lastName: true } }
                            }
                        }
                    }
                }
            }
        });
        res.json(tournament);
    } catch (error) {
        next(error);
    }
});


app.get("/api/groups", async (req, res, next) => {
    try {
        const { tournamentId } = req.query; // 👈 aquí es query
        if (!tournamentId) return res.status(400).json({ error: "Falta tournamentId" });

        const groups = await prisma.tournamentGroup.findMany({
            where: { tournamentId: tournamentId as string },
        });

        res.json(groups);
    } catch (error) {
        next(error);
    }
});


app.get("/api/matches", async (req, res, next) => {
    try {
        const { groupId } = req.query;
        if (!groupId) return res.status(400).json({ error: "groupId required" });
        const matches = await prisma.match.findMany({
            where: { groupId: groupId as string },
            include: {
                group: true
            },
        });
        res.json(matches);
    } catch (error) {
        next(error);
    }
});

app.put("/api/matches/:id", async (req, res, next) => {
    try {
        console.log("Updating match:", req.params.id, req.body);
        const { id } = req.params;
        const { data } = req.body;

        const match = await prisma.match.update({
            where: { id },
            data: {
                tournament: { connect: { id: data.tournamentId } },
                group: { connect: { id: data.groupId } },
                date: data.date,
                status: data.status,
                sets: data.sets,
                winnerId: data.winnerId

            },
        });


        res.json(match);
    } catch (error) {
        next(error);
    }
});

app.patch("/api/matches/:id/finish", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, winnerId } = req.body;

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status, winnerId },
    });

    res.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match status:", error);
    res.status(500).json({ error: "Error updating match status" });
  }
});





app.post("/api/matches", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tournamentId } = req.body;
        if (!tournamentId) return res.status(400).json({ error: "tournamentId required" });

        const registrations = await prisma.tournamentTeam.findMany({ where: { tournamentId } });
        if (registrations.length < 2) return res.status(400).json({ error: "At least 2 teams required" });

        const toCreate = [];
        for (let i = 0; i < registrations.length; i++) {
            for (let j = i + 1; j < registrations.length; j++) {
                toCreate.push({
                    data: {
                        tournamentId,
                        teamAId: registrations[i].id,
                        teamBId: registrations[j].id,
                        sportType: "volleyball",
                        status: "pending",
                    }
                });
            }
        }

        // Ejecutar en transacción para crear y devolver los registros
        const createdMatches = await prisma.$transaction(
            toCreate.map((item) => prisma.match.create(item))
        );

        return res.status(201).json({ created: createdMatches.length, matches: createdMatches });
    } catch (error) {
        next(error);
    }
});


app.post("/api/matches/groups", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tournamentId, groupsCount = 2 } = req.body;
        if (!tournamentId) return res.status(400).json({ error: "tournamentId required" });

        const teams = await prisma.tournamentTeam.findMany({ where: { tournamentId } });
        if (teams.length < 2) return res.status(400).json({ error: "At least 2 teams required" });
        if (groupsCount < 1) return res.status(400).json({ error: "groupsCount must be > 0" });

        // Mezclar equipos aleatoriamente
        const shuffled = [...teams].sort(() => Math.random() - 0.5);

        // Dividir equipos en grupos
        const groups: any[] = Array.from({ length: groupsCount }, () => []);
        shuffled.forEach((team, i) => {
            groups[i % groupsCount].push(team);
        });

        const createdGroups = await prisma.$transaction(async (tx) => {
            const groupRecords = [];
            const matchRecords = [];

            for (let g = 0; g < groups.length; g++) {
                const groupName = `Grupo ${String.fromCharCode(65 + g)}`; // A, B, C...
                const group = await tx.tournamentGroup.create({
                    data: { tournamentId, name: groupName },
                });
                groupRecords.push(group);

                // Asignar equipos a este grupo
                for (const team of groups[g]) {
                    await tx.tournamentTeam.update({
                        where: { id: team.id },
                        data: { groupId: group.id },
                    });
                }

                // Generar encuentros internos (round robin)
                for (let i = 0; i < groups[g].length; i++) {
                    for (let j = i + 1; j < groups[g].length; j++) {
                        matchRecords.push({
                            tournamentId,
                            groupId: group.id,
                            teamAId: groups[g][i].id,
                            teamBId: groups[g][j].id,
                            sportType: "volleyball",
                            status: "pending",
                        });
                    }
                }
            }

            // Crear todos los matches a la vez
            await tx.match.createMany({ data: matchRecords, skipDuplicates: true });

            return { groups: groupRecords, matches: matchRecords.length };
        });

        res.status(201).json({
            message: `Se generaron ${createdGroups.groups.length} grupos y ${createdGroups.matches} encuentros.`,
        });
    } catch (error) {
        next(error);
    }
});


app.get("/api/matches", async (req, res, next) => {
    try {
        const { tournamentId } = req.query;

        if (!tournamentId || typeof tournamentId !== "string") {
            return res.status(400).json({ error: "tournamentId is required" });
        }

        const matches = await prisma.match.findMany({
            where: { tournamentId },

        });

        res.json(matches);
    } catch (error) {
        next(error);
    }
});

app.get("/api/matches/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Invalid match ID" });
        }

        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                teamA: {
                    include: {
                        team: {
                            include: {
                                players: true,
                                coach: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
                teamB: {
                    include: {
                        team: {
                            include: {
                                players: true,
                                coach: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
                sets: {
                    orderBy: { setNumber: 'asc' }
                },
                group: true,
                tournament: true,
            },
        });
        const cleanMatch = {
            ...match,
            teamAName: match?.teamA.team?.name || match?.teamA.teamName,
            teamBName: match?.teamB.team?.name || match?.teamB.teamName,
        };


        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        res.json(cleanMatch);
    } catch (error) {
        next(error);
    }
});


app.post("/api/matches/:matchId/sets", async (req, res, next) => {
    try {
        const { matchId } = req.params;

        // Verificar si el partido existe
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        // Verificar si ya hay un set en progreso para evitar duplicados
        const activeSet = await prisma.matchSet.findFirst({
            where: { matchId, status: "in_progress" },
        });

        if (activeSet) {
            return res.status(400).json({ error: "There is already an active set" });
        }

        // Obtener cuántos sets existen ya para determinar el número del siguiente
        const existingSets = await prisma.matchSet.count({ where: { matchId } });
        const nextSetNumber = existingSets + 1;

        // Crear el nuevo set (normalmente el primero)
        const newSet = await prisma.matchSet.create({
            data: {
                matchId,
                setNumber: nextSetNumber,
                teamAPoints: 0,
                teamBPoints: 0,
                status: "in_progress",
            },
        });

        // Obtener todos los sets del partido (incluido el recién creado)
        const sets = await prisma.matchSet.findMany({
            where: { matchId },
            orderBy: { setNumber: "asc" },
        });

        res.status(201).json(sets);
    } catch (error) {
        console.error("Error creating match set:", error);
        next(error);
    }
});


app.post("/api/matches/:matchId/sets/:setId/finish", async (req, res, next) => {
    try {
        const { matchId, setId } = req.params;
        const { winnerId } = req.body;

        // Finalizar el set actual
        const finishedSet = await prisma.matchSet.update({
            where: { id: setId },
            data: { status: "finished", winnerId },
        });

        // Obtener todos los sets existentes del partido
        const allSets = await prisma.matchSet.findMany({
            where: { matchId },
            orderBy: { setNumber: "asc" },
        });

        // Crear el siguiente set automáticamente
        const nextSetNumber = allSets.length + 1;
        const nextSet = await prisma.matchSet.create({
            data: {
                matchId,
                setNumber: nextSetNumber,
                teamAPoints: 0,
                teamBPoints: 0,
                status: "in_progress",
            },
        });

        res.json({ finishedSet, nextSet, allSets: [...allSets, nextSet] });
    } catch (error) {
        console.error("Error finishing set:", error);
        next(error);
    }
});


app.patch("/api/matches/:matchId/sets/:setId", async (req, res, next) => {
    try {
        const { matchId, setId } = req.params;
        const { teamAPoints, teamBPoints } = req.body;

        // Validaciones mínimas
        if (typeof teamAPoints !== "number" || typeof teamBPoints !== "number") {
            return res.status(400).json({ error: "Invalid points" });
        }
        // Actualizar puntos del set
        const updatedSet = await prisma.matchSet.update({
            where: { id: setId },
            data: { teamAPoints, teamBPoints },
        });

        res.json(updatedSet);
    } catch (error) {
        next(error);
    }
});






// CLUB SETTINGS
app.get('/api/club-settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.clubSettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.clubSettings.create({
                data: {
                    id: 1,
                    name: "Voley Club",
                    logoUrl: "/logo-default.svg",
                    primaryColor: '#DC2626',
                    secondaryColor: '#F9FAFB',
                    tertiaryColor: '#FBBF24',
                    backgroundColor: '#000000',
                    surfaceColor: '#1F2937',
                    textPrimaryColor: '#F9FAFB',
                    textSecondaryColor: '#9CA3AF',
                    teamCreationEnabled: true,
                    monthlyPaymentEnabled: true,
                }
            });
        }
        const { primaryColor, secondaryColor, tertiaryColor, backgroundColor, surfaceColor, textPrimaryColor, textSecondaryColor, ...rest } = settings;
        const frontendSettings: ClubSettings = {
            ...rest,
            colors: {
                primary: primaryColor,
                secondary: secondaryColor,
                tertiary: tertiaryColor,
                background: backgroundColor,
                surface: surfaceColor,
                textPrimary: textPrimaryColor,
                textSecondary: textSecondaryColor,
            }
        };
        res.json(frontendSettings);
    } catch (error) {
        next(error);
    }
});

app.put('/api/club-settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { colors, ...rest } = req.body as ClubSettings;
        const dbSettings = {
            ...rest,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            tertiaryColor: colors.tertiary,
            backgroundColor: colors.background,
            surfaceColor: colors.surface,
            textPrimaryColor: colors.textPrimary,
            textSecondaryColor: colors.textSecondary,
        };

        const updatedSettings = await prisma.clubSettings.update({
            where: { id: 1 },
            data: dbSettings,
        });
        res.json(req.body); // Return in frontend format
    } catch (error) {
        next(error);
    }
});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
