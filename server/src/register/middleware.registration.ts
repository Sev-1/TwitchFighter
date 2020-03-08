import * as bodyParser from "body-parser";
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import * as cors from "cors";
import * as env from "../environments/environment";

const jsConfig = require('../swagger.json');

const allowList: string[] = [
    'http://localhost:4200',
    env.allowedCors,
];

const corsOptions: cors.CorsOptions = {
    origin: allowList
};

export function RegisterMiddleware(app: express.Express) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors(corsOptions));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(jsConfig));
}
