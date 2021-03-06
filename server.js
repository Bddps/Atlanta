
	// Atlanta Server is created by: Kevin Sánchez
	// Skype: Kesen0

	// Atlanta requirements to running

	Properties = require('./properties')
	Express = require('express')
	Database = require('mysql')
	Path = require('path')

	Server = Express()
	TcpListenConnections = require('./bin/bootstrap')(Server, Properties)

	RenderEngine = require('swig')
	Cookies = require('cookie-parser')
	Debug = require('morgan')
	Sessions = require('express-session')
	Redis = require('connect-redis')(Sessions)
	DataParser = require('body-parser')
	SessionProtection = require('csurf')

	Server.engine('html', RenderEngine.renderFile)
	Server.set('view engine', 'html')
	Server.use(DataParser.json())
	Server.use(Debug('dev'))

	Server.use(DataParser.urlencoded({
		extended: true
	}))

	// Connecting with server of RedisStore
	RedisClient = require('./Application/Common/Redis').connect("redis://redistogo:0f64c058c46494f08687fe1afce82a80@grouper.redistogo.com:10344")

	Server.use(Cookies())
	Server.use(Sessions({
		name: Properties.Cookie.ssid,
		secret: Properties.Cookie.secret,
		resave: true,
		store: new Redis({client: RedisClient}),
    	saveUninitialized: true
	}))

	// Cross Site Request Forgery protection
	Server.use(SessionProtection())

	// This is not recommended in production
	Server.use('/static/', Express.static(Path.join(__dirname, 'public')))
	
	Server.set('views', Path.join(__dirname, 'Application/Templates'))

	// Create a connection with the Database.
	MySQL = Database.createConnection(Properties.Database)
	MySQL.connect()

	Router = require('./Application/Router')(Server, MySQL)

	console.log('[DEBUG] Atlanta started successful !')
