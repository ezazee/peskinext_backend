declare module 'bcrypt';
declare module 'bcryptjs';
declare module 'slugify';
declare module 'cors';
declare module 'cookie-parser';
declare module 'morgan';
declare module 'swagger-ui-express';
declare module 'multer';
declare module 'swagger-jsdoc';
declare module 'jsonwebtoken';
declare module 'node-fetch';


declare module 'express' {
    export interface Request<P = any, ResBody = any, ReqBody = any, ReqQuery = any> {
        [key: string]: any;
        body: ReqBody;
        query: ReqQuery;
        params: P;
        cookies: any;
        user?: any;
    }
    export interface Response<ResBody = any> {
        [key: string]: any;
        json(data: any): this;
        status(code: number): this;
        send(data: any): this;
        sendStatus(code: number): this;
        cookie(name: string, val: any, options?: any): this;
        clearCookie(name: string, options?: any): this;
    }
    export interface NextFunction {
        (err?: any): void;
    }
    export interface Express {
        use(...args: any[]): any;
        listen(port: number | string, callback?: () => void): any;
        get(...args: any[]): any;
        post(...args: any[]): any;
        put(...args: any[]): any;
        delete(...args: any[]): any;
        patch(...args: any[]): any;
        [key: string]: any;
    }
    export interface Router {
        use(...args: any[]): any;
        get(...args: any[]): any;
        post(...args: any[]): any;
        put(...args: any[]): any;
        delete(...args: any[]): any;
        patch(...args: any[]): any;
        [key: string]: any;
    }

    function express(): Express;
    namespace express {
        export function Router(): Router;
        export function json(): any;
        export function urlencoded(options?: any): any;
        export function static(root: string, options?: any): any;
    }
    export default express;
}
