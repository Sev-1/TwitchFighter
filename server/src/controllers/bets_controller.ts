import * as express from 'express';
import { ControllerRouter } from './controller_router';
import Bets, { Bets as BetsInterface } from '../models/bets.model';
import User, { User as UsersInterface } from '../models/user.model';
import * as _ from 'lodash';

interface ResultLeaderboard {
    _id: any;
    totalBet: number;
    totalWon: number;
    userName: string;
}

export class BetsController implements ControllerRouter {
    public router = express.Router();
    public route = '/bets';
    public leaderboard: ResultLeaderboard[];
    
    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/stream/:streamId', this.getStreamBets);
        this.router.get('/:userId', this.getAllUserBets);
        this.router.get('/totalStats/:userId', this.getTotalStatsUserBets);
        this.router.get('/totalWon/:userId', this.getTotalWonUserBets);
        this.router.get('/totalLost/:userId', this.getTotalLostUserBets);
        this.router.get('/', this.getLeaderboardStats);
        this.router.post('/', this.createBet);
        this.router.patch('/:id', this.updateBetsResult);
        this.router.delete('/:id', this.deleteBet);
    }
    /**
     * @swagger
     *
     * /bets/{userId}/{streamId}:
     *   get:
     *     description: Get all user Bets on a stream
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: userId
     *         description: User ID
     *         required: true
     *         schema:
     *           type: string
     *       - in: path
     *         name: streamId
     *         description: Stream ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getStreamBets(req: express.Request, res: express.Response, next: express.NextFunction) {
        const streamId: string = req.params.streamId;
        try {
            const query = Bets.find();
            query.where('streamId').equals(streamId);
            const streams = await query.exec();
            res.json(streams);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets/{userId}:
     *   get:
     *     description: Get history of user Bets inclusive of active bets
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: userId
     *         description: User ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getAllUserBets(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userId = req.params.userId;
        try {
            const query = Bets.find();
            query.where('userId').equals(userId);
            const bets = await query.exec();
            res.json(bets);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets/totalStats/{userId}:
     *   get:
     *     description: Get sum statistics of user bets
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: userId
     *         description: User ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getTotalStatsUserBets(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userId = req.params.userId;
        try {
            const result = await Bets.aggregate([
                {
                    $match: {
                        userId,
                    }
                }, {
                    $group: {
                        _id: userId,
                        totalBet: { $sum: "$betAmount" },
                        avgBet: { $avg: "$betAmount" },
                        minBet: { $min: "$betAmount" },
                        maxBet: { $max: "$betAmount" }
                    }
                }
            ]);
            res.json(result);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets/totalWon/{userId}:
     *   get:
     *     description: Get total winning of user bets
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: userId
     *         description: User ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getTotalWonUserBets(req: express.Request, res: express.Response, _next: express.NextFunction) {
        const userId = req.params.userId;
        try {
            const result = await Bets.aggregate([
                {
                    $match: {
                        userId,
                        betResult: "Win",
                    }
                }, {
                    $group: {
                        _id: userId,
                        totalBet: { $sum: "$betAmount" },
                        totalWon: { $sum: 1 }
                    }
                }
            ]);
            res.json(result);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    async getLeaderboardStats(_req: express.Request, res: express.Response, _next: express.NextFunction) {
        try {
            const results = await Bets.aggregate([
                {
                    $match: {
                        betResult: "Win",
                    }
                }, {
                    $group: {
                        _id: { userId: "$userId" },
                        totalBet: { $sum: "$betAmount" },
                        totalWon: { $sum: 1 }
                    }
                }, {
                    $sort: {
                        totalBet: -1,
                    },
                }
            ]);
            const leaderboard: ResultLeaderboard[] = [];
            for (const result of results) {
                const name = await User.findById({_id: result._id.userId});
                leaderboard.push({
                    _id: _.get(result,'_id'),
                    totalBet: result.totalBet,
                    totalWon: result.totalWon,
                    userName: `${name.firstName} ${name.lastName}`,
                });
            };
            res.send(leaderboard);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }
    
    /**
     * @swagger
     *
     * /bets/totalLost/{userId}:
     *   get:
     *     description: Get total lost of user bets
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: userId
     *         description: User ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getTotalLostUserBets(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userId = req.params.userId;
        try {
            const result = await Bets.aggregate([
                {
                    $match: {
                        userId,
                        betResult: "Lose",
                    }
                }, {
                    $group: {
                        _id: userId,
                        totalBet: { $sum: "$betAmount" },
                        totalLosses: { $sum: 1 }
                    }
                }
            ]);
            res.json(result);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets:
     *   get:
     *     description: Get all bests in DB
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async getAllBets(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const bets = await Bets.find();
            res.json(bets);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to get users ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets:
     *   post:
     *     description: Create a new bet
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: bets
     *         description: bets object
     *         in: body
     *         required: true
     *         type: string
     *         schema:
     *             $ref: '#/definitions/Bets'
     *     responses:
     *       200:
     *         response:
     *           schema:
     *             $ref: '#/definitions/Bets'
     */
    async createBet(req: express.Request, res: express.Response, next: express.NextFunction) {
        const bet: BetsInterface = req.body;
        console.log(bet);
        try {
            const result: BetsInterface[] = await Bets.create([bet]);
            res.json(result);
        }
        catch (error) {
            const e = JSON.stringify(error);
            console.error(`Failed to create user ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /bets/{id}:
     *   patch:
     *     description: Update an existing Bet result
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: user
     *         description: Bets object
     *         required: true
     *         schema:
     *           $ref: '#/definitions/Bets'
     *       - in: path
     *         name: id
     *         description: Bets ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           schema:
     *             $ref: '#/definitions/Bets'
     */
    async updateBetsResult(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id: string = req.params.id;
        const newInfo: BetsInterface = req.body;
        try {
            const oldBet = await Bets.findById(id);
            await oldBet.updateOne({$set: newInfo});

            const newBet = await Bets.findById(id);
            res.json(newBet);
        }
        catch (error) {
            const e = JSON.stringify(error);
            next(console.error(`Failed to update user ${e}`));
        }
    }

    /**
     * @swagger
     *
     * /bets/{id}:
     *   delete:
     *     description: Delete bet by id
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: path
     *         name: id
     *         description: Bet ID
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Bets'
     */
    async deleteBet(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id: string = req.params.id;
        try {
            await Bets.findByIdAndDelete(id);
            res.status(204).send();
        }
        catch (error) {
            const e = JSON.stringify(error);
            next(console.error(`Failed to update user ${e}`));
        }
    }
}
