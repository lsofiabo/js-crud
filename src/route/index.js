// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {
	static #list = [];

	constructor(name, author, cover) {
		this.id = Math.floor(Math.random() * 9000 + 1000);
		this.name = name;
		this.author = author;
		this.cover = cover;
	}

	static create(name, author, cover) {
		const newTrack = new Track(name, author, cover);
		this.#list.push(newTrack);
		return newTrack;
	}

	static getList() {
		return this.#list.reverse();
	}

	static getById(id) {
		return this.#list.find((track) => track.id === Number(id));
	}
}

Track.create(
	'Beyond the North Waves',
	'Immortal',
	'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2F69a7a085aaeb00e5bce3611479a0c246.905x905x1.jpg'
);

Track.create(
	'Can\'t stop',
	'Red Hot Chilli Peppers',
	'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2Fa477e44a7eb4e075ccea50be11e6db3e.531x543x1.jpg'
);

Track.create(
	'Le chale bleu',
	'Les Yeaux Noirs',
	'https://e-cdn-images.dzcdn.net/images/cover/4b3fd86bfc384dcc63f0c2905c484117/500x500-000000-80-0-0.jpg'
);

Track.create(
	'The End of Dormancy',
	'Voivod',
	'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2Fc58720e69e8ba0f16c04c41ea183488c.1000x1000x1.jpg'
);

Track.create(
	'Non, je ne regrettes rien',
	'Edith Piaf',
	'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2Fabeeccbc9a179fff0b6cd313efdbe438.500x498x1.jpg',
);

Track.create(
	'~end of THE WORLD~',
	'JO☆STARS',
	'https://static.jojowiki.com/images/thumb/4/4a/latest/20191015215131/JoJo_OP4.jpg/400px-JoJo_OP4.jpg',
);


class Playlist {

	static #list = [];

	constructor(name) {
		this.id = Math.floor(Math.random() * 9000 + 1000);
		this.name = name;
		this.tracks = [];
	}

	static create(name) {
		const newPlaylist = new Playlist(name);
		this.#list.push(newPlaylist);
		return newPlaylist;
	}

	static getList() {
		return this.#list.reverse();
	}

	deleteTrackById (trackId) {
		this.tracks = this.tracks.filter((track) => track.id !== trackId);
	}

	addTrackById (trackId) {
		const track = Track.getById(trackId);
		this.tracks.push(track);
	}

	static getById(id) {
		return this.#list.find((playlist) => playlist.id === Number(id));
	}

	static makeMix(playlist) {
		const tracks = Track.getList();
		let randomTracks = tracks.sort(() => Math.random() - 0.5).slice(0, 3);
		playlist.tracks.push(...randomTracks);
	}

	static findListByValue(value) {
		return this.#list.filter((playlist) => 
			playlist.name.toLowerCase().includes(value.toLowerCase())
		)
	}
}

const pl1 = Playlist.create('Плейліст1');
const pl2 = Playlist.create('Плейліст2');
const pl3 = Playlist.create('Плейліст3');

Playlist.makeMix(pl1);
Playlist.makeMix(pl2);
Playlist.makeMix(pl3);

// ================================================================

router.get('/', function(req, res) {
	res.render('index', {
		style: 'index',

		data: {},
	})
})

router.get('/spotify-create', function(req, res) {
	const isMix = !!req.query.isMix;

	res.render('spotify-create', {
		style: 'spotify-create',
		data: {
			isMix,
		},
	})
})

router.post('/spotify-create', function(req, res) {
	const isMix = !!req.query.isMix;

	const name = req.body.name;
	if (!name) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				message: 'Введіть назву плейліста',
				link: isMix ? '/spotify-create?isMix=true' : '/spotify-create',
			}
		})
	}

	const playlist = Playlist.create(name);

	if (isMix) {
		Playlist.makeMix(playlist);
	}

	const tracks = playlist.tracks;

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			id: playlist.id,
			name: playlist.name,
			tracks,
		},
	})
})

router.get('/spotify-playlist', function(req, res) {
	const playlistId = Number(req.query.id);
	const playlist = Playlist.getById(playlistId);
	
	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			id: playlistId,
			name: playlist.name,
			tracks: playlist.tracks,
		},
	})
	
})

router.get('/spotify-track-delete', function(req, res) {
	const playlistId = Number(req.query.playlistId);
	const trackId = Number(req.query.trackId);

	const playlist = Playlist.getById(playlistId);

	if (!playlist) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				message: 'Плейліст не знайдено',
				link: '/spotify-playlist?id=' + playlistId,
			}
		})
	}

	playlist.deleteTrackById(trackId);

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			id: playlist.id,
			name: playlist.name,
			tracks: playlist.tracks,
		},
	})
})

router.get('/spotify-playlist-add', function(req, res) {
	const playlistId = Number(req.query.playlistId);

	res.render('spotify-playlist-add', {
		style: 'spotify-playlist-add',
		data: {
			id: playlistId,
			tracks: Track.getList(),
		},
	})
})

router.get('/spotify-track-add', function(req, res) {
	const playlistId = Number(req.query.playlistId);
	const trackId = Number(req.query.trackId);

	const playlist = Playlist.getById(playlistId);
	playlist.addTrackById(trackId);

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			id: playlist.id,
			name: playlist.name,
			tracks: playlist.tracks,
		},
	})
})

router.get('/spotify-library', function(req, res) {
	res.render('spotify-library', {
		style: 'spotify-library',
		data: {
			playlists: Playlist.getList(),
		},
	})
})

router.get('/spotify-search', function(req, res) {
	res.render('spotify-search', {
		style: 'spotify-search',
		data: {
			playlists: Playlist.getList(),
		},
	})
})

router.post('/spotify-search', function(req, res) {
	const value = req.body.value || '';
	const found = Playlist.findListByValue(value);

	res.render('spotify-search', {
		style: 'spotify-search',
		data: {
			playlists: found,
			value
		},
	})
})


// ================================================================


// Підключаємо роутер до бек-енду
module.exports = router
