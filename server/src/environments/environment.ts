export const baseUrl = process.env.BaseUrl || 'http://localhost';
export const port = process.env.PORT || 8080;
export const mongoDbUrl = process.env.CUSTOMCONNSTR_mongoDbConnStr || 'mongodb://127.0.0.1:27017/';
export const allowedCors = process.env.AllowedCors;
