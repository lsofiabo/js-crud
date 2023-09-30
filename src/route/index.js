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

class Product {
	static #list = [];

	constructor (name, price, description) {
		this.id = Math.floor(Math.random() * 10000) + 1;
		this.name = name;
		this.price = price;
		this.description = description;
		this.createDate = new Date();
	}

	static getList = () => this.#list;

	static add = (product) => {
		if (this.getById(product.id) !== false) {
			return false;
		}
		this.#list.push(product);
		return true;
	}

	static getById = (id) => {
		const index = this.#list.findIndex(
			(product) => product.id === Number(id)
		);
		if (index != -1) {
			return this.#list[index];
		}
		return false;
	}

	static updateById = (id, data) => {
		const user = this.getById(id);
		if (!user) {
			return false;
		}
		Object.assign(user, data);
		return true;
	}

	static deleteById = (id) => {
		const index = this.#list.findIndex( (product) => product.id === id );
		if (index === -1) {
			return false;
		} else {
			this.#list.splice(index, 1);
			return true;
		}
	}
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

router.get('/product-create', function(req, res) {
	res.render('product-create', {
		style: 'product-create'

	})
} )

// ================================================================

router.post('/product-create', function(req, res) {

	const { name, price, description } = req.body;
	console.log(name, price, description);
	const product = new Product(name, Number(price), description);
	const result = Product.add(product);

	let message = 'Product was not created';
	if (result) {
		message = 'Product was created successfully';
	}

	res.render('alert', {
		style: 'product-create',
		data: {
			success: result,
			message: message,
		}
	})

})

// ================================================================

router.get('/product-list', function(req, res) {


	for (let i = 0; i < 20; i++) {
		const pr = new Product('azaza', 123, 'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.');
		Product.add(pr);
	}

	const products = Product.getList();
	console.log(products);
	res.render('product-list', {
		style: 'product-create',
		isNotEmpty: products.length !== 0,
		products: products,
	})
})

// ================================================================

router.get('/product-edit', function(req, res) {

	let { id } = req.query;
	id = Number(id);
	const product = Product.getById(id);

	if (!product) {
		res.render('alert', {
			style: 'product-create',

			date: {
				success: false,
				message: 'Could not find product',
			}
		})
	} else {
		res.render('product-edit', {
			style: 'product-create',
			product: {
				name: product.name,
				price: product.price,
				id: product.id,
				description: product.description,
			}
		})
	}
})

// ================================================================

router.post('/product-edit', function(req, res) {

	const { name, price, id, descirption } = req.body;
	const result = Product.updateById(id, {name, price, descirption});

	let message = 'Product was not changed.';

	if (result) {
		message = 'Product successfully changed';
	}

	res.render('alert', {
		style: 'product-create',
		data: {
			success: result,
			message: message,
		}
	})
})

// ================================================================

router.get('/product-delete', function(req, res) {

	const { id } = req.query;

	const result = Product.deleteById(Number(id));

	let message = 'Product was not deleted';
	if (result) {
		message = 'Product was successfully deleted';
	}

	res.render('alert', {
		style: 'product-create',
		data: {
			success: result,
			message: message,
		}
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
