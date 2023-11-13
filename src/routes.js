import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    // GET
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const {search} = req.query;

            console.log(`
            --------------------------------------------------------------------------------
            A busca dentro da query é: ${search}`);

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null);

            return res.end(JSON.stringify(tasks));
        }
    },

    // POST
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const {title, description} = req.body;

            const now = new Date();

            if (!title) {
                return res.writeHead(400).end(
                  JSON.stringify({ message: 'title is required' }),
                );
              }
        
              if (!description) {
                return res.writeHead(400).end(
                  JSON.stringify({message: 'description is required' })
                );
              }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: now,
                updated_at: now
            }

            database.insert('tasks', task);

            return res.writeHead(201).end();
        }
    },

    // PUT
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            const {title, description} = req.body;

            if (!title || !description){
                return res.writeHead(400).end(
                    JSON.stringify({message: 'description or title is required' })
                );
            }

            const [task] = database.select('tasks', { id });

            if (!task){
                return res.writeHead(404).end();
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date()
            });

            return res.writeHead(204).end();
        }
    },

    // DELETE
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            const [task] = database.select('tasks', { id });

            if (!task) {
                return res.writeHead(404).end();
            }

            database.delete('tasks', id);

            return res.writeHead(204).end();
        }
    },

    // PATCH
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;

            const [task] = database.select('tasks', { id });

            if (!task) {
                return res.writeHead(404).end();
            }

            const isTaskCompleted = !!task.completed_at;
            const now = new Date();
            const completed_at = isTaskCompleted ? null : now;

            database.update('tasks', id, {completed_at, updated_at: now});

            return res.writeHead(204).end();
        }
    }

]