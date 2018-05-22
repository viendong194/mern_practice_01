import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { getSecret } from './secret';
import Comment from './models/comment';

// and create our instances
const app = express();
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;
// db config -- set your URI from mLab in secrets.js
mongoose.connect(
  // place url mlab here
	() => {
		console.log('connection success');
	}
);

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open',()=>console.log("ok ok"))
// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));
// Use our router configuration when we call /api

// now we can set the route path & initialize the API
router.get('/', (req, res) => {
	res.json({ message: 'Hello, World!' });
});
router.get('/comments', (req, res) => {
	Comment.find((err, comments) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: true, data: comments });
	});
});

router.post('/comments', (req, res) => {
	const comment = new Comment();

	const { author, text } = req.body;

	if (!author || !text) {
	  return res.json({
	    success: false,
	    error: 'You must give me an author and comment'
	  });
	}
	comment.author = req.body.author;
	comment.text = req.body.text;

	comment.save((err) => {
		if (err) return res.json({ success: false, error: err });
		return res.json({ success: req.body.author });
	});
});

router.put('/comments/:commentId', (req, res) => {
	const { commentId } = req.params;
	if (!commentId) {
		return res.json({ success: false, error: 'No comment id provided' });
	}
	Comment.findById(commentId, (error, comment) => {
		if (error) return res.json({ success: false, error });
		const { author, text } = req.body;
		if (author) comment.author = author;
		if (text) comment.text = text;
		comment.save((error) => {
			if (error) return res.json({ success: false, error });
			return res.json({ success: true });
		});
	});
});

router.delete('/comments/:commentId', (req, res) => {
	const { commentId } = req.params;
	if (!commentId) {
		return res.json({ success: false, error: 'No comment id provided' });
	}
	Comment.remove({ _id: commentId }, (error, comment) => {
		if (error) return res.json({ success: false, error });
		return res.json({ success: true });
	});
});

app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
