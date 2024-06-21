const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    taskFour,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description/completed', async () => {
        await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
           completed: false
        })
        .expect(400)
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should fetch user tasks by id', async () => {
        await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not fetch other user tasks by id', async () => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${userOne._id}`)
        //.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(401)
})

test('Should delete user task', async () => {
        await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()  
        .expect(200)
})

test('Should not delete other users tasks', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not delete task if unauthenticated', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
       // .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(401)
})

test('Should not update task with invalid description/completed', async () => {
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        completed: ' false'
    })
    .expect(400)
})

test('Should not update other users task', async () => {
     await request(app)
    .patch(`/tasks/${taskFour._id}`)
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'From my test'
    })
    .expect(404)
})

test('Should fetch only completed tasks', async () => {
       await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should fetch only completed tasks', async () => {
    const res = await request(app)
     .get('/tasks?completed=false')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send()
     .expect(200)
     console.log(res)
})


test('Should sort tasks by description/completed/createdAt/updatedAt', async () => {
    const res = await request(app)
     .get('/tasks?sortBy=completed:desc')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send()
     .expect(200)
})

test('Should fetch page of tasks', async () => {
    const res = await request(app)
     .get('/tasks?limit=1')
     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
     .send()
     .expect(200)
     console.log(res)
})