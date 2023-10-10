"use strict";

let currentUser;
let comments = new Map();
let voted = [];

const commentsElement = document.querySelector(".comments");

const modalContainer = document.querySelector(".modal-container");
const overlay = document.querySelector(".overlay");
const btnCancel = document.querySelector(".no-cancel");
const btnApprove = document.querySelector(".yes-delete");
btnCancel.addEventListener("click", () => {
	modalContainer.classList.remove("active");
});
overlay.addEventListener("click", () => {
	modalContainer.classList.remove("active");
});
btnApprove.addEventListener("click", (evt) => {
	modalContainer.classList.remove("active");
	deleteComment(evt.currentTarget.comment);
});
const deleteComment = (targetComment) => {
	const targetCommentGroup = targetComment.closest('.comment-replies-group');
	const commentGroupObj = comments.get(targetCommentGroup.id);
	const targetId = parseInt(targetComment.id.substring(8));
	if (commentGroupObj.id === targetId) {
		comments.delete(targetCommentGroup.id);
	} else {
		const targetIndex = commentGroupObj.replies.findIndex(obj => obj.id === targetId);
		commentGroupObj.replies.splice(targetIndex, 1);
	}
	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));

	targetComment.remove();
}
const showDeleteModal = (targetComment) => {
	btnApprove.comment = targetComment;
	modalContainer.classList.add("active");	
}


const upvoteComment = (targetComment) => {
	if (voted.includes(targetComment.id)) return;
	voted.push(targetComment.id);

	const scoreElement = targetComment.querySelector(`.comment-score`);
	const newScore = parseInt(scoreElement.textContent) + 1;
	scoreElement.textContent = newScore;

	const targetCommentGroup = targetComment.closest('.comment-replies-group');
	const commentGroupObj = comments.get(targetCommentGroup.id);
	const targetId = parseInt(targetComment.id.substring(8));
	if (commentGroupObj.id === targetId) {
		commentGroupObj.score = newScore;
	} else {
		commentGroupObj.replies.find(obj => obj.id === targetId).score = newScore;
	}
	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));
}
const downvoteComment = (targetComment) => {
	if (!voted.includes(targetComment.id)) return;
	voted = voted.filter(item => item !== targetComment.id);
	
	const scoreElement = targetComment.querySelector(`.comment-score`);
	const newScore = parseInt(scoreElement.textContent) - 1;
	scoreElement.textContent = newScore;

	const targetCommentGroup = targetComment.closest('.comment-replies-group');
	const commentGroupObj = comments.get(targetCommentGroup.id);
	const targetId = parseInt(targetComment.id.substring(8));
	if (commentGroupObj.id === targetId) {
		commentGroupObj.score = newScore;
	} else {
		commentGroupObj.replies.find(obj => obj.id === targetId).score = newScore;
	}
	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));

}

const editComment = (targetComment) => {
	const content = targetComment.querySelector('.comment-content');
	const contentText = content.querySelector('.comment-text');
	const btnEdit = targetComment.querySelector('.edit .tool-text');

	if (btnEdit.textContent === "Cancel") {
		btnEdit.textContent = "Edit";
		content.classList.remove('active');
		content.contentEditable = false;
		targetComment.querySelector('.update').remove();
		return;
	}

	btnEdit.textContent = "Cancel";

	const btnUpdate = document.createElement('button');
	btnUpdate.classList.add('btn', 'update');
	btnUpdate.textContent = "update";
	targetComment.querySelector('.comment-tools').insertAdjacentElement('beforebegin', btnUpdate);
	
	contentText.contentEditable = true;
	contentText.focus();
	content.classList.add('active');

}
const update = (targetComment, btn) => {
	const content = targetComment.querySelector('.comment-content');
	const newContentText = content.querySelector('.comment-text').textContent;

	targetComment.querySelector('.edit .tool-text').textContent = "Edit";
	targetComment.querySelector('.update').remove();
	content.classList.remove('active');
	content.contentEditable = false;

	const targetCommentGroup = targetComment.closest('.comment-replies-group');
	const commentGroupObj = comments.get(targetCommentGroup.id);
	const targetId = parseInt(targetComment.id.substring(8));
	if (commentGroupObj.id === targetId) {
		commentGroupObj.content = newContentText;
	} else {
		commentGroupObj.replies.find(obj => obj.id === targetId).content = newContentText;
	}

	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));

}


let replyFormComment = null;
let replyForm = null;
const replyComment = (targetComment) => {

const editBtnText = targetComment.querySelector('.reply .tool-text');

	if(replyForm) {
		const nextElement = targetComment.nextElementSibling;
		if(replyFormComment === targetComment) {
			editBtnText.textContent = "Reply";
			replyForm.remove();
			replyFormComment = null;
			replyForm = null;
			return;
		} 
		replyFormComment.querySelector('.reply .tool-text').textContent = "Reply";
		replyForm.remove();
	}

	replyForm = createReplyForm(targetComment);
	replyFormComment = targetComment;

	/* to reply */
	if (targetComment.parentElement.classList.contains("replies-comments")) {
		targetComment.insertAdjacentElement('afterend', replyForm);
	/* to main comment */
	} else {
		targetComment.nextElementSibling.querySelector('.replies-comments').insertAdjacentElement('afterbegin', replyForm);
	}
	replyForm.focus();

	editBtnText.textContent = "Cancel";

}
const addReplyComment = (targetComment, form, content) => {

	const replyingTo = targetComment.querySelector(`.sender-name`).textContent;
	const commentId = generateCommentId();

	const commentObject = {
		id: commentId,
		content: content,
		createdAt: "now",
		score: 0,
		replyingTo: replyingTo,
		user: currentUser
	};

	form.parentElement.appendChild(createComment(commentObject, true, "reply"));
	form.remove();

	const groupOgj = comments.get(targetComment.closest('.comment-replies-group').id);
	console.log(targetComment.closest('.comment-replies-group').id);
	groupOgj.replies.push(commentObject);
	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));

}	


commentsElement.addEventListener('click',  (event) => {
		if (event.target.classList.contains('reply')) {
			replyComment(event.target.closest('.comment'));
		}  else if (event.target.classList.contains('edit')) {
			editComment(event.target.closest('.comment'));
		} else if(event.target.classList.contains('delete')) {
			showDeleteModal(event.target.closest('.comment'));
		} else if (event.target.classList.contains('update')) {
			update(event.target.closest('.comment'));
		} else if (event.target.classList.contains('upvote')) {
			upvoteComment(event.target.closest('.comment'));
		} else if(event.target.classList.contains('downvote')) {
			downvoteComment(event.target.closest('.comment'));
		}
})


const commentInputForm = document.querySelector('.send-comment-form');
const commentInput = commentInputForm.querySelector('.comment-input');
const addComment = () => {
	if (commentInput.value === "") return;

	const commentId = generateCommentId();

	const commentObject = {
		id: commentId,
		content: commentInput.value,
		createdAt: "now",
		score: 0,
		user: currentUser,
		replies: []
	};

	commentsElement.appendChild(createCommentReplyGroup(commentObject));
	commentInput.value = "";

	comments.set(`commentGroup_${commentId}`, commentObject);

	scroll();

	localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));

}
commentInputForm.querySelector('.send-btn').addEventListener('click', () => {
	addComment();
});


const formatTimeDifference = (creationDate) => {
	const timeDifference = Date.now() - creationDate;

	if (timeDifference >= 31536000000) {
		const years = Math.floor(timeDifference / 31536000000);
		return `${years} ${years === 1 ? 'year' : 'years'} ago`;
	} else if (timeDifference >= 2592000000) {
			const months = Math.floor(timeDifference / 2592000000);
			return `${months} ${months === 1 ? 'month' : 'months'} ago`;
	} else if (timeDifference >= 604800000) {
			const weeks = Math.floor(timeDifference / 604800000);
			return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
	} else if (timeDifference >= 86400000) {
			const days = Math.floor(timeDifference / 86400000);
			return `${days} ${days === 1 ? 'day' : 'days'} ago`;
	} else if (timeDifference >= 3600000) {
			const hours = Math.floor(timeDifference / 3600000);
			return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
	} else if (timeDifference >= 60000) {
			const minutes = Math.floor(timeDifference / 60000);
			return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
	} else {
			const seconds = Math.floor(timeDifference / 1000);
			return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
	}
}
const generateCommentId = () => {
	return Date.now();
}

const createReplyForm = (targetComment) => {
	const formContainer = document.createElement('div');
	formContainer.classList.add('form', 'send-reply-form');

		const formInput = document.createElement('textarea');
		formInput.classList.add('input', 'reply-input');
		formInput.placeholder = "Add a comment...";

		const image = document.createElement('img');
		image.classList.add('inputUserImage');
		image.src = currentUser.image.webp;
		image.alt = "user image";

		const btnSend = document.createElement('button');
		btnSend.classList.add('btn', 'send-btn');
		btnSend.textContent = "send";

	formContainer.appendChild(formInput);
	formContainer.appendChild(image);
	formContainer.appendChild(btnSend);

	btnSend.addEventListener('click', () => {
		targetComment.querySelector('.reply .tool-text').textContent = "Reply";
		if (formInput.value === ''){
			formContainer.remove();
			return;
		}
		addReplyComment(targetComment, formContainer, formInput.value);
	});

	return formContainer;
}


const btnReplyTemplate = document.getElementById("btn-reply-template")
const btnEditDeleteTemplate = document.getElementById("btn-edit-delete-template")
const createComment = (commentData, isYou, type) => {
	const commentContainer = document.createElement('div');
	commentContainer.classList.add('comment');
	commentContainer.id = `comment_${commentData.id}`;

		const header = document.createElement('div');
		header.classList.add('comment-header');

			const headerImage = document.createElement('img');
			headerImage.classList.add('sender-img');
			headerImage.src = commentData.user.image.webp;
			headerImage.alt = 'user image';

			const senderName = document.createElement('span');
			senderName.classList.add('sender-name');
			senderName.textContent = commentData.user.username;

			const date = document.createElement('span');
			date.classList.add('date');
			date.textContent = commentData.createdAt;

			header.appendChild(headerImage);
			header.appendChild(senderName);
			header.appendChild(date);

		const content = document.createElement('p');
		content.classList.add('comment-content');

			const contentText = document.createElement('span');
			contentText.classList.add('comment-text');
			contentText.innerText = commentData.content;

			content.appendChild(contentText);
		
		const voteContainer = document.createElement('div');
		voteContainer.classList.add('vote');

			const btnUpvote = document.createElement('button');
			btnUpvote.classList.add('btn-vote', 'upvote');
			btnUpvote.textContent = '+';

			const score = document.createElement('span');
			score.classList.add('comment-score');
			score.textContent = commentData.score;

			const btnDownvote = document.createElement('button');
			btnDownvote.classList.add('btn-vote', 'downvote');
			btnDownvote.textContent = '-';

			voteContainer.appendChild(btnUpvote);
			voteContainer.appendChild(score);
			voteContainer.appendChild(btnDownvote);

		commentContainer.appendChild(header);
		commentContainer.appendChild(content);
		commentContainer.appendChild(voteContainer);

	if (type === "reply") {
		const replyTo = document.createElement('span');
		replyTo.classList.add('reply-to');
		replyTo.textContent = commentData.replyingTo + ", ";
		replyTo.contentEditable = "false";
		content.insertBefore(replyTo, contentText);
	}
	if (isYou) {
		
		const youLabel = document.createElement('span');
		youLabel.classList.add('you');
		youLabel.textContent = 'you';
		header.insertBefore(youLabel, senderName.nextSibling);

		const commentTools = btnEditDeleteTemplate.content.cloneNode(true);
		commentContainer.appendChild(commentTools);

	} else {
		const commentTools = btnReplyTemplate.content.cloneNode(true);
		commentContainer.appendChild(commentTools);
	}

	return commentContainer;

};
const createCommentReplyGroup = (group) => {
	const groupContainer = document.createElement('div');
	groupContainer.classList.add('comment-replies-group');
	groupContainer.id = `commentGroup_${group.id}`;

		const mainComment = createComment(group, group.user.username === currentUser.username, "comment");

		const repliesContainer = document.createElement('div');
		repliesContainer.classList.add('replies');

			const repliesThreadLine = document.createElement('div');
			repliesThreadLine.classList.add('replies-thread-line');

			const repliesComments = document.createElement('div');
			repliesComments.classList.add('replies-comments');

				group.replies.forEach(reply => {
					repliesComments.appendChild(createComment(reply, reply.user.username === currentUser.username, "reply"));
				});

		repliesContainer.appendChild(repliesThreadLine);
		repliesContainer.appendChild(repliesComments);

	groupContainer.appendChild(mainComment);
	groupContainer.appendChild(repliesContainer);

	return groupContainer;
}

function scroll() {
	commentsElement.scrollTop = commentsElement.scrollHeight;
}

fetch("./data.json")
.then((res) => {
	if(!res.ok) throw new Error("not a valid response");
	return res.json();
})
.then((jsonData) => {

	currentUser = jsonData.currentUser;

	const localComments = localStorage.getItem("comments");
	if (localComments === null) {
		jsonData.comments.forEach(commentGroup => {
			comments.set(`commentGroup_${commentGroup.id}`, commentGroup);
			commentsElement.appendChild(createCommentReplyGroup(commentGroup));
		});
		localStorage.setItem("comments", JSON.stringify(Array.from(comments.entries())));
	} else {
		comments = new Map(JSON.parse(localComments));
		for (let commentGroup of comments.values()) {
			commentsElement.appendChild(createCommentReplyGroup(commentGroup));
		}
	}
	
	document.querySelector(".inputUserImage").src = currentUser.image.webp;

	scroll();

});