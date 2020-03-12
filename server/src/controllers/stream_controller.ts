import * as express from 'express';

import {ControllerRouter} from './controller_router';

import Stream, {Stream as StreamInterface} from '../models/stream.model';

export class StreamController implements ControllerRouter {
    public router = express.Router();
    public route = '/stream';

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', this.getFeaturedStreams);
        this.router.get('/all', this.getStreams);
        this.router.post('/', this.createStream);
        this.router.patch('/:id', this.updateStream);
    }


    /**
     * @swagger
     *
     * /stream:
     *   get:
     *     description: Gets all stream data
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Stream'
     */
    async getStreams(req: express.Request, res: express.Response){
        try{
            const streams = await Stream.find();
            console.log("Returning streams: " + JSON.stringify(streams));
            res.json(streams);
        }catch(error){
            const e = JSON.stringify(error);
            console.error(`Failed to get streams ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /getFeaturedStreams:
     *   get:
     *     description: Gets the 3 featured stream data
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Stream'
     */
    async getFeaturedStreams(req: express.Request, res: express.Response){
        try{
            const streams = await Stream.find();
            console.log("Returning streams: " + JSON.stringify(streams));
            res.json(streams.slice(0,3));
        }catch(error){
            const e = JSON.stringify(error);
            console.error(`Failed to get streams ${e}`);
        }
    }

    /**
     * @swagger
     *
     * /stream:
     *   post:
     *     description: creates a stream object
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: streamURL
     *         description: Stream object
     *         required: true
     *         type: string
     *         schema:
     *            $ref: '#/definitions/Stream'
     *     responses:
     *       200:
     *         response:
     *           type: array
     *           items:
     *              $ref: '#/definitions/Stream'
     */
    async createStream(req: express.Request, res: express.Response){
        const stream: StreamInterface = req.body;
        try{
            const result: StreamInterface[] = await Stream.create([stream]);
            res.json(result);
        } catch(error){
            const e = JSON.stringify(error);
            console.error(`Failed to create stream ${e}`);
            res.status(400).json({"error": error.name, "message": error.message});
        }
    }

    /**
     * @swagger
     *
     * /user/{id}:
     *   patch:
     *     description: Update an existing stream
     *     produces:
     *       - application/json
     *     parameters:
     *       - in: body
     *         name: stream
     *         description: stream object
     *         required: true
     *         schema:
     *           $ref: '#/definitions/Stream'
     *       - in: path
     *         name: id
     *         description: Stream URL
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         response:
     *           schema:
     *             $ref: '#/definitions/Stream'
     */
    async updateStream(req: express.Request, res: express.Response, next: express.NextFunction){
        const id: string = req.params.id;
        const newInfo: StreamInterface = req.body;
        try{
            const oldStream = await Stream.findById(id);

            await oldStream.updateOne({$set: newInfo});

            const newStream = await Stream.findById(id);
            res.json(newStream);
        }catch(error){
            const e = JSON.stringify(error);
            next(console.error(`Failed to update stream ${e}`));
        }
    }
}
