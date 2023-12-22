// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Purchase {
	static DELIVERY_PRICE = 150;
	static #BONUS_FACTOR = 0.1;

	static #list = [];
	static #count = 0;

	static #bonusAccount = new Map();

	static getBonusBalance = (email) => {
		return Purchase.#bonusAccount.get(email) || 0;
	}

	static calcBonusAmount = (value) => {
		return value * Purchase.#BONUS_FACTOR;
	}

	static updateBonusBalance = (
		email, price, bonusUse = 0
	) => {
		const amount = this.calcBonusAmount(price);
		const currentBalance = Purchase.getBonusBalance(email);

		const updatedBalance = currentBalance + amount - bonusUse;

		Purchase.#bonusAccount.set(email, updatedBalance);
		console.log(email, updatedBalance);
		return amount;
	}

	constructor(data, product) {
		this.id = ++Purchase.#count;

		this.firstname = data.firstname;
		this.lastname = data.lastname;

		this.tel = data.tel;
		this.email = data.email;

		this.comment = data.comment || null;

		this.bonus = data.bonus || 0;

		this.promocode = data.promocode || null;

		this.total_price = data.total_price;
		this.product_price = data.product_price;
		this.delivery_price = data.delivery_price;
		this.quantity = data.quantity;

		this.product = product;
	}

	static add = (...arg) => {
		const newPurchase = new Purchase(...arg);
		Purchase.#list.push(newPurchase);
		return newPurchase;
	}

	static getListByEmail = (email) => {
		return Purchase.#list.filter((item) => item.email === email);
	}

	static getByID = (id) => {
		return Purchase.#list.find((item) => item.id === id);
	}

	static updateByID = (id, data) => {
		const purchase = Purchase.getByID(id);
		if (purchase) {
			if (data.firstname) purchase.firstname = firstname;
			if (data.lastname) purchase.lastname = data.lastname;
			if (data.tel) purchase.tel = data.tel;
			if (data.email) purchase.email = data.email;

			return true;
		} else {
			return false;
		}
	}
}

class Product {
	static #list = [];
	static #count = 0;

	constructor(image, name, characteristics, is_ready, is_top, price, quantity = 0) {
		this.id = ++Product.#count;
		this.image = image;
		this.name = name;
		this.characteristics = characteristics;
		this.is_ready = is_ready;
		this.is_top = is_top;
		this.price = price;
		this.quantity = quantity;
	}

	static add = (...data) => {
		const newProduct = new Product(...data);
		Product.#list.push(newProduct);
	}

	static getList = () => Product.#list;

	static getByID = (id) => {
		return Product.#list.find((product) => product.id === id);
	}

	static getRandomFromList = (id) => {
		const filteredList = Product.#list.filter((product) => product.id !== id);

		const shuffledList = filteredList.sort(
			() => Math.random() - 0.5
		);

		return shuffledList.slice(0, 3);
	}
}

class Promocode {
	static #list = [];


	cconstructor(name, factor) {
		this.name = name;
		this.factor = factor;
	}

	static add = (name, factor) => {
		const newPromo = new Promocode(name, factor);
		Promocode.#list.push(newPromo);
		return newPromo;
	}

	static getByName = (name) => {
		return this.#list.find((promo) => promo.name === name);
	}

	static calc = (promo, price) => {
		return price * promo.factor;
	}
}

Promocode.add('SUMMER2023', 0.9);
Promocode.add('DISCOUNT50', 0.5);
Promocode.add('SALE25', 0.75);

// ================================================================

router.get('/', function(req, res) {

	for (let index = 0; index < 16; index++) {
		Product.add('https://picsum.photos/200/300', 'Artline Gaming', 'Amd Ryzen 5 3600 (3.6 - 4.2 GGz) / RAM 16 Gb / HDD 1 Tb + SSD 480 Gb', true, true, 27000, 9);
	}

	res.render('index', {
		style: 'index',

		data: {
			category: 'Laptops and computers',
			products: Product.getList(),
		},
	})
})

router.get('/purchase-product', function(req, res) {
	const id = Number(req.query.id);

	res.render('purchase-product', {
		style: 'purchase-product',

		data: {
			list: Product.getRandomFromList(),
			product: Product.getByID(id),
		}
	})
})

router.post('/purchase-create', function(req, res) {
	console.log(req.body);
	const id = Number(req.query.id);
	const quantity = Number(req.body.quantity);

	if (quantity < 1) {
		res.render('alert', {
			style: 'alert',
			data: {
				message: 'Error',
				info: 'Product quantity invalid',
				link: `/purchase-product?id=${id}`,
			}
		})
	}

	const product = Product.getByID(id);

	if (product.quantity < 1) {
		res.render('alert', {
			style: 'alert',
			data: {
				message: 'Error',
				info: 'Product not in stock',
				link: `/purchase-product?id=${id}`,
			}
		})
	}

	const cart = {
		name: product.name,
		price: product.price,
		quantity: quantity,
	};

	let total_price = cart.price * cart.quantity;
	const delivery_price = Purchase.DELIVERY_PRICE;
	total_price += delivery_price;

	const bonus = Purchase.calcBonusAmount(total_price);

	res.render('purchase-create', {
		style: 'purchase-create',
		form_heading: 'Your purchase',
		cart: cart,
		delivery_price: delivery_price,
		total_price: total_price,
		id: id,
		bonuses: bonus,
	})
})

router.post('/purchase-submit', function(req, res) {

	console.log(req.body);

	const id = Number(req.query.id);

	let {
		lastname,
		firstname,
		tel,
		email,
		total_price,
		delivery_price,
		quantity,
		bonuses,
		promocode,

	} = req.body

	const product = Product.getByID(id);

	if (!product) {
		return res.render('alert', {
			style: 'alert',

			data: {
				message: 'Error',
				info: 'Product not found',
				link: '/',
			}
		})
	}

	if (product.quantity < quantity) {
		return res.render('alert', {
			style: 'alert',

			data: {
				message: 'Error',
				info: 'Not enough product in stock',
				link: '/',
			}
		})
	}

	total_price = Number(total_price);
	product_price = product.price;
	delivery_price = Number(delivery_price);
	quantity = Number(quantity);
	bonuses = Number(bonuses);

	if (
		isNaN(total_price) ||
		isNaN(product_price) ||
		isNaN(delivery_price) ||
		isNaN(quantity) ||
		isNaN(bonuses)
	) {
		return res.render('alert', {
			style: 'alert',

			data: {
				message: 'Error',
				info: 'Invalid data',
				link: '/',
			}
		})
	}

	if (!firstname || !lastname || !email || !tel) {
		return res.render('alert', {
			style: 'alert',

			data: {
				message: 'Error',
				info: 'Fill required fields',
				link: '/',
			}
		})
	}

	if (bonuses || bonuses > 0) {
		const bonusAmount = Purchase.getBonusBalance(email);
		console.log(bonusAmount);

		if (bonuses > bonusAmount) {
			bonuses = bonusAmount;
		}

		Purchase.updateBonusBalance(email, total_price, bonuses);

		total_price -= bonuses;
	} else {
		Purchase.updateBonusBalance(email, total_price, 0);
	}

	console.log(`Total price: ${total_price}, bonuses: ${bonuses}`);

	if (promocode) {
		promocode = Promocode.getByName(promocode);

		if (promocode) {
			total_price = Promocode.calc(promocode, total_price);
		}
	}

	if (total_price < 0) total_price = 0;

	console.log(
		lastname,
		firstname,
		tel,
		email,
		total_price,
		delivery_price,
		quantity,
		bonuses,
		promocode
	);

	const purchase = Purchase.add(
		{
			total_price,
			product_price,
			delivery_price,
			quantity,

			firstname,
			lastname,
			email,
			tel,
			promocode,
			bonuses,
		}, product
	);

	console.log(purchase);
	console.log(purchase);

	res.render('alert', {
		style: 'alert',
		data: {
			message: 'Success!',
			info: 'Purchase created successfully',
			link: '/purchase-info?id=' + purchase.id,
		}
	})
})

router.get('/purchase-info', function(req, res) {

	const id = Number(req.query.id);

	let {
		firstname,
		lastname,
		tel,
		email,
		comment,
		bonus,
		promocode,
		total_price,
		product_price,
		delivery_price,
		quantity,
		product,
	} = Purchase.getByID(id);

	let product_name = product.name;

	res.render('purchase-info', {
		style: 'purchase-info',
		data: {
			id,
			firstname,
			lastname,
			phone: tel,
			email,
			comment,
			bonus: bonus + "$",
			promocode,
			total_price: total_price + "$",
			product_price: product_price + "$",
			delivery_price: delivery_price + "$",
			quantity,
			product_name,
		}
	})
})

router.get('/purchase-edit', function(req, res) {
	
	const id = Number(req.query.id);
	const purchase = Purchase.getByID(id);

	console.log('ID: ' + id);
	console.log(purchase);

	let { firstname, lastname, email, tel } = purchase;
	console.log(firstname, lastname, email, tel);

	res.render('purchase-edit', {
		style: 'purchase-edit',
		data: {
			id,
			firstname,
			lastname,
			email,
			tel,
		}
	})
})

router.post('/purchase-edit', function(req, res) {
	const id = Number(req.query.id);
	
	res.render('alert', {
		style: 'alert',
		data: {
			message: 'Success!',
			info: 'Purchase updated successfully',
			link: '/my-purchases?id=' + id,
		}
	})
})

router.get('/my-purchases', function(req, res) {
	const id = Number(req.query.id);
	const email = Purchase.getByID(id).email;

	const purchases = Purchase.getListByEmail(email);

	res.render('my-purchases', {
		style: 'my-purchases',
		data: {
			purchases,
		},
	})

})

// ================================================================


// Підключаємо роутер до бек-енду
module.exports = router
