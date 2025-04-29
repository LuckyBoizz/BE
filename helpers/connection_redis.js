const redis = require("redis");

const client = redis.createClient({
	username: 'default',
	password: 'cv0vzd5qd01r43EA03Gqem6HBFmOfHTX',
	socket: {
		host: 'redis-17293.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
		port: 17293
	}
});

client.on("connect", () => {
	console.log("Connected to Redis");
});

client.on("ready", () => {
	console.log("Redis is ready to use");
});

client.on('error', err => console.log('Redis Client Error', err));

client
	.connect()
	.then(r => {console.log(r)});

module.exports = client;
