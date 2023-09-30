// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================


class User {
	static #list = [];

	constructor(email, login, password) {
		this.email = email
		this.login = login
		this.password = password
		this.id = new Date().getTime()
	}

	static add = (user) => {
		this.#list.push(user);
	}

	static getList = () => {
		return this.#list;
	}

	static getById = (id) => 
		this.#list.find((user) => user.id === Number(id))

	static deleteById = (id) => {
		const index = this.#list.findIndex(
			(user) => user.id === Number(id),
		)

		if(index != -1) {
			this.#list.splice(index, 1)
			return true;
		}
		return false;
	}

	static updateById = (id, data) => {
		const user = this.getById(id);
		if (user) {
			this.update(user, data);
			return true;
		}
		return false;
	}

	static update = (user, { email }) => {
		if (email) {
			user.email = email;
		}
	}

	verifyPassword = (password) => this.password === password;
}


// ================================================================

// router.get Створює нам один ентпоїнт

router.get('/', function (req, res) {


	const list = User.getList();

	res.render('index', {
		style: 'index',

		data: {
			users: {
				list,
				isEmpty: list.length === 0,
			},
		},
	})
})

// ================================================================

router.post('/user-create', function (req, res) {

	const {email, login, password} = req.body;

	const user = new User(email, login, password);
	User.add(user);
	console.log(User.getList());


	res.render('success-info', {
		style: 'index',
		info: 'User created!',
	})
})

// ================================================================

router.get('/user-delete', function (req, res) {

	const { id } = req.query;

	if (User.deleteById(id)) {
		console.log('deleted!')
	}

	res.render('success-info', {
		style: 'index',
		info: 'User deleted!',
	})
})

// ================================================================

router.post('/user-update', function (req, res) {

	const { id, email, password } = req.body;

	let result = false;
	const user = User.getById(Number(id));
	if (user.verifyPassword(password)) {
		result = User.updateById(Number(id), { email });
	}

	console.log(result)

	res.render('success-info', {
		style: 'index',
		info: result ? 'Email changed!' : 'Email NOT changed :(',
	})
})

// ================================================================


// Підключаємо роутер до бек-енду
module.exports = router
