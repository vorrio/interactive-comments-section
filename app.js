"use strict";

let currentUser;

const comments = document.querySelector(".comments");

const deleteComment = (id) => {
	document.querySelector(`#comment${id}`).remove();
}
const editComment = (id) => {
	document.querySelector(`#comment${id}`).classList.add("editable");
	document.querySelector(`#comment${id} .comment-input`).value = document.querySelector(`#comment${id} .comment-text`).innerHTML;
}
const replyComment = (id) => {
	if (document.querySelector(".reply-input") !== null) return;
	document.querySelector(`#comment${id}`).insertAdjacentHTML('afterend', createReplyForm(id));
	document.querySelector(".inputUserImage").src = currentUser.image.webp;
}
const upvoteComment = (id) => {
	const scoreElement = document.querySelector(`#comment${id} .comment-score`);
	scoreElement.innerHTML = parseInt(scoreElement.innerHTML) + 1;
}
const downvoteComment = (id) => {
	const scoreElement = document.querySelector(`#comment${id} .comment-score`);
	scoreElement.innerHTML = parseInt(scoreElement.innerHTML) - 1;
}

const update = (id) => {
	document.querySelector(`#comment${id}`).classList.remove("editable");
	document.querySelector(`#comment${id} .comment-text`).innerHTML = document.querySelector(`#comment${id} .edit-input`).value
}
const addReplyComment = (id) => {
	const replyingTo = document.querySelector(`#comment${id} .sender-name`).innerHTML;
	const content = document.querySelector(`#input${id}`).value;
	const newReply = createComment({
		id: 100,
		content: content,
		createdAt: "now",
		score: 0,
		replyingTo: replyingTo,
		user: currentUser
	}, true, "reply");
	document.querySelector(`#comment${id}`).insertAdjacentHTML('afterend', newReply);
	document.querySelector(`#form${id}`).remove();
}	
const addComment = () => {
	const content = document.querySelector(`.comment-input`).value;
	const newComment = createCommentReplyGroup({
		id: 100,
		content: content,
		createdAt: "now",
		score: 0,
		user: currentUser,
		replies: []
	});
	document.querySelector(`#group${2}`).insertAdjacentHTML('afterend', newComment);
}

const createReplyForm = (id) => `
<div class="send-comment-form" id="form${id}">
	<textarea class="input reply-input" id="input${id}" placeholder="Add a comment..."></textarea>
	<div class="flex-between">
		<img class="inputUserImage" src="" alt="user">
		<button class="btn" onClick="addReplyComment(${id})">send</button>
	</div>
</div>
`

const createComment = (group, isYou, type) => `
		<div class="comment" id="comment${group.id}">
			<div class="comment-header">
				<img class="sender-img" src="${group.user.image.webp}" alt="sender image">
				<span class="sender">
					<span class="sender-name">${group.user.username}</span>	
					${isYou ? '<span class="you">you</span></span>' : ''}
				<span class="date">${group.createdAt}</span>
			</div>
			<p class="comment-content">
				${(type === "reply") ? `<span class="reply-to">${group.replyingTo}</span>` : ''}
				<span class="comment-text">${group.content}</span>
			</p>
			${isYou ? `<textarea class="input edit-input" style="width: 100%;" placeholder="Add a comment..."></textarea>` : ''}
			<div class="vote">
				<button class="btn-vote upvote" onClick="upvoteComment(${group.id})">+</button>
				<span class="comment-score">${group.score}</span>
				<button class="btn-vote downvote" onClick="downvoteComment(${group.id})">-</button>
			</div>
			<div class="comment-tools">
			${isYou ? `
				<button class="comment-tool delete" onClick="deleteComment(${group.id})">
					<img src="./images/icon-delete.svg" alt="icon delete">
					<span class="tool-text">Delete</span>
				</button>
				<button class="comment-tool edit" onClick="editComment(${group.id})">
					<img src="./images/icon-edit.svg" alt="icon edit">
					<span class="tool-text">Edit</span>
				</button> 
				<button class="btn update" onClick="update(${group.id})">update</button>`
				: `
				<button class="comment-tool reply" onClick="replyComment(${group.id})">
					<img src="./images/icon-reply.svg" alt="icon reply">
					<span class="tool-text">Reply</span>
				</button>
				`
			}
			</div>
		</div>
		`;

		const createCommentReplyGroup = (group) => {
			let commentReplyGroup = `
			<div class="comment-replies-group" id="group${group.id}">
				${createComment(group, group.user.username === currentUser.username, "comment")}
				<div class="replies">
					<div class="replies-thread-line"></div>
					<ul class="replies-comments">
			`
			group.replies.forEach(reply => {commentReplyGroup += createComment(reply, reply.user.username === currentUser.username, "reply") });

			commentReplyGroup +=`
					</ul>
				</div>
			</div>
			`;
			return commentReplyGroup;
		};

function scroll() {
	comments.scrollTop = comments.scrollHeight;
}

fetch("./data.json")
	.then((res) => {
		if(!res.ok) throw new Error("not a valid response");
		return res.json();
	})
	.then((jsonData) => {

		currentUser = jsonData.currentUser;
		const comments = jsonData.comments;

		const commentsElement = document.querySelector(".comments");
		
		document.querySelector(".inputUserImage").src = currentUser.image.webp;
		
		

		comments.forEach(comment => {
			commentsElement.innerHTML += createCommentReplyGroup(comment);
		});

		scroll();

	});