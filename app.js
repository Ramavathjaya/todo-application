const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());

let database;
const initializeDBandServer = async () => {
    try {
        database = await open({
            filename: path.join(__dirname, "todoApplication.db"),
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000/");
        });
    } catch (error) {
        console.log(`DataBase error is ${error.message}`);
        process.exit(1);
    }
};
initializeDBandServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
        requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
};

const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
    return (
        requestQuery.category !== undefined && requestQuery.status !== undefined 
    );
};

const hasCategoryAndPriority = (requestQuery) => {
    return (
        requestQuery.category !== undefined && requestQuery.priority !== undefined 
    );
};

const hasSearchProperty = (requestQuery) => {
    return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
    return requestQuery.category !== undefined;
};

const outPutResult = (dbObject) => {
    return {
        id: dbObject.id,
        todo: dbObject.todo,
        priority: dbObject.priority,
        category: dbObject.status,
        dueDate: dbObject.due_date,
    };
};

app.get("/todos/", async (request, response) => {
    let data = null;
    let getTodosQuery = "";
    const { search_q  = "", priority, status, category } = request.query;
    /* console.log(hasPriorityAndStatusProperties(request.query));
    console.log(hasCategoryAndStatus(request.query));
    console.log(hasCategoryAndPriority(request.query));
    console.log(hasPriorityProperty(request.query));
    console.log(hasStatusProperty(request.query));
    console.log(hasCategoryProperty(request.query));
    console.log(hasSearchProperty(request.query));*/

    /** switch case''*/
    switch (true) {
        //scenario 3 
        /*----------- has priority and status --------- */
        case hasPriorityAnsStatusProperties(request.query):
        if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
            if (
                status === "TO DO" ||
                status === "IN PROGRESS" || 
                status === "DONE" 
            ) {
                getTodosQuery = `
            SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
                 data = await database.all(getTodosQuery);
                 response.send(data.map((eachItem) => outPutResult(echItem)));
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }

        break;

        //scenario 5 
        case hasCategoryAndStatus(request.query):
        if (
            category === "WORK" ||
            category === "HOME" ||
            category === "LEARNING" 
        ) {
            if (
               status === "TO DO" ||
               status === "IN PROGRESS" ||
               status === "DONE" 
            ) {
                getTodosQuery = ` SELECT * from todo where category = '${category}' and status='${satus}';`;
                data = await database.all(getTodosQuery);
                response.send(data.map((eachItem) => outPutResult(eachitem)));
            } else {
                response.status(400);
                response.send("Invalid Todo Status");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }

        break;

        //scenario 7 
        case hasCategoryAndPriority(request.query):
        if (
            category === "WORK" ||
            category === "HOME" ||
            category === "LEARNING"
        ) {
            if (
                priority === "HIGH" ||
                priority === "MEDIUM" ||
                priority === "LOW"

            ) {
             getTodosQuery = `SELECT * from todo where category='${category}' and priority='${priority}';`;
             data = await database.all(getTodosQuery);
             response.send(data.map((eachItem) => outPutResult(eachItem)));
            } else {
                response.status(400);
                response.send("Invalid Todo Priority");
            }
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }

        break;

        // scenario 2 
        case hasPriorityProperty(request.query):
         if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
            getTodosQuery = `
           SELECT * FROM todo WHERE priority = '${priority}';`;
             data = await database.all(getTodosQuery);
             response.send(data.map((eachItem) => outPutResult(eachItem)));
         } else {
            response.status(400);
            response.send("Invalid Todo Priority");
         }

         break;

         //scenario 1 
        case hasStatusProperty(request.query):
          if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
            getTodosQuery = `SELECT * FROM todo WHERE status = '${status}';`;
            data = await database.all(getTodosQuery);
            response.send(data.map((eachItem) => outPutResult(eachItem)));
          } else {
            response.status(400);
            response.send("Invalid Todo Status");
          }

         break;
         //has only search property 
         //scenario 4 
         case hasSearchProperty(request.query):
          getTodosQuery = `SELECT * from todo where todo like '%${search_q}%';`;
          data = await database.all(getTodosQuery);
          response.send(data.map((eachItem) => outPutResult(eachItem)));
          break;
          //scenario 6 
          case hasCategoryProperty(request.query):
          if (
            category === "WORK" ||
            category === "HOME" ||
            category === "LEARNING"
          ) {
            getTodosQuery = `SELECT * from todo where category = '${category}';`;
            data = await database.all(getTodosQuery);
            reponse.sed(data.map((eachItem) => outPutResult(eachItem)));
          } else {
            response.status(400);
            response.send("Invalid Todo category");
          }
          break;

          //default get all todos 
          default:
            getTodosQuery = `SELECT * from todo;`;
            data = await database.all(getTodosQuery);
            response.send(data.map((eachItem) => outPutResult(eachItem)));
    }
});

app.get("todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const getTodosQuery = `select * from todo where id=${todoId};`;
    const responseResult = await database.get(getToDoQuery);
    response.send(outPutResult(responseResult));
});

app.get("/agenda/", async (request, response) => {
    const { date } = request.query;
    console.log(isMatch(date, "yyyy-MM-dd"));
    if (isMatch(date, "yyyy-MM-dd")) {
        const newDate = format(new Date(date),"yyyy-MM-dd");
        console.log(newDate);
        const requestQuery = `select * from todo where due_date='${newDate}';`;
        const responseResult = await database.all(requestQuery);
        //console.log(responseResult);
        response.send(responseResult.map((eachItem) => outPutResult(eachItem)));
    } else {
        response.status(400);
        response.send("Invalid Due Date");
    }
});

//api4
app.post("/todos/", async (request, response) => {
    const { id, todo, priority, staus, category, dueDate } = rrequest.body;
    if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
            if (
                category === "WORK" ||
                category === "HOME" ||
                category === "LEARNING"
            ) {
                if (isMatch(dueDate, "yyyy-MM-dd")) {
                    const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
                    const postTodoQuery = `
                INSERT INTO 
                  todo (id, todo, category, priority, status, due_date)
                VALUES 
                  (${id}, '${todo}', '${category}', '${priority}', '${status}', '${postNewDueDate}');`;
                  await database.run(posTodoQuery);
                  //console.log(responseResult);
                  response.send("Todo Successfully Added");
                } else {
                    response.status(400);
                    response.send("Invalid Due Date");
                }
            } else {
                response.send(400);
                response.send("Invalid Todo Category");
            }

        } else {
            response.send(400);
            response.send("Invalid Todo Sattus");
        }
    } else {
        response.send(400);
        response.send("Invalid Todo Priority");
    }
});

app.put("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    console.log(requestBody);
    const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const previousTodo = await database.get(previousTodoQuery);
    const {
        todo = previousTodo.status,
        priority = previousTodo.priority,
        status = previousTodo.status,
        category = previousTodo.category,
        dueDate = previousTodo.dueDate,
    } = request.body;

    let updateTodoQuery;
    switch (true) {
        // update status 
        case requestBody.status !== undefined:
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
            updateTodoQuery = `
        UPDATE todo SET todo = '${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}' WHERE id = ${todoId};`;

           await database.run(updateTodoQuery);
           response.send("Status Updated");
        } else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
        break;

        //update priority 
        case requestBody.priority !== undefined:
        if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
            updateTodoQuery = `
        UPDATE todo SET todo = '${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}' WHERE id = ${todoId};`;
           
           await database.run(updateTododQuery);
           response.send(`Priority Updated`);
        } else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }
         break;

         //update todo 
         case requestBody.todo !== undefined:
          updateTodoQuery = `
        UPDATE todo SET todo ='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}; WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send('Todo Updated');
        break;

        //update category 
        case requestBody.category !== undefined:
        if (
            category === "WORK" ||
            category === "HOME" ||
            category === "LEARNING" 
        ) {
            updateTodoQuery = `
        UPDATE todo SET todo ='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}; WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send('Category Updated');
        } else {
            response.status(400);
            response.send("Invalid Todo Category");
        }
        break;

        //update due date 
        case requestBody.dueDate !== undefined:
        if (isMatch(dueDate, "yyyy-MM-dd")) {
            const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
            updateTodoQuery = `
        UPDATE todo SET todo ='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}; WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send('Due Date Updated');
        } else {
            response.status(400);
            response.send("Invalid Due Date");
        }
        break;
    }

    /*updateTodoQuery = `
    UPDATE todo SET todo ='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}; WHERE id = ${todoId};`;
    const responseData = await database.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);*/
});

//api6

app.delete("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const deleteTodoQuery = `
    DELETE FROM 
      todo
    WHERE 
      id = ${todoId};`;

      await database.run(deleteTodoQuery);
      response.send("Todo Deleted");
});

module.exports=app;







