"use strict";

let lastCommentId = 0;
let currentUser;
let comments;
let voted = [];

const commentsElement = document.querySelector(".comments");

const overlay = document.querySelector(".overlay");
const modalContainer = document.querySelector(".modal-container");
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
	deleteComment(evt.currentTarget.commentId);
});

const deleteComment = (id) => {
	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		
		for (let i = comments.length - 1; i >= 0; i--) {
			if(comments[i].replies.length !== 0) {
				for (let j = comments[i].replies.length - 1; j >= 0; j--) {
					if (comments[i].replies[j].id === id) {
						comments[i].replies.splice(j, 1);
						localStorage.setItem("comments", JSON.stringify(comments));
					}
				}
			}
		}
	} else {
		for (let i = comments.length - 1; i >= 0; i--) {
			if (comments[i].id === id) {
				comments.splice(i, 1);
				localStorage.setItem("comments", JSON.stringify(comments));
			}
		}
	}

	document.querySelector(`#comment${id}`).remove();
}
const showDeleteModal = (id) => {

	btnApprove.commentId = id;

	modalContainer.classList.add("active");	

}
const editComment = (id) => {
	if (document.querySelector(`#comment${id}`).classList.contains("editable")) {
		document.querySelector(`#comment${id} .edit .tool-text`).innerHTML = "Edit"
		document.querySelector(`#comment${id}`).classList.remove("editable");
		return;
	}

	if (document.querySelector(".comment.editable") !== null) {
		document.querySelector(".comment.editable .edit .tool-text").innerHTML = "Edit"
		document.querySelector(".comment.editable").classList.remove("editable")
	};

	document.querySelector(`#comment${id} .edit .tool-text`).innerHTML = "Cancel"
	document.querySelector(`#comment${id}`).classList.add("editable");
	document.querySelector(`#comment${id} .edit-input`).value = document.querySelector(`#comment${id} .comment-text`).innerHTML;
	document.querySelector(`#comment${id} .edit-input`).focus()
}
const replyComment = (id) => {
	if (document.querySelector(`#form${id}`)) {
		document.querySelector(`#form${id}`).remove();
		document.querySelector(`#comment${id} .reply .tool-text`).innerHTML = "Reply";
		return;
	};

	if (document.querySelector(".reply-input") !== null) document.querySelector(".reply-input").parentElement.remove();

	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		document.querySelector(`#comment${id}`).insertAdjacentHTML('afterend', createReplyForm(id));
	} else {
		document.querySelector(`#group${id} .replies-comments`).insertAdjacentHTML('afterbegin', createReplyForm(id));
	}
	document.querySelector(`#input${id}`).focus()

	document.querySelector(".inputUserImage").src = currentUser.image.webp;

	document.querySelector(`#comment${id} .reply .tool-text`).innerHTML = "Cancel";

}
const upvoteComment = (id) => {
	if (voted.includes(id)) return;
	voted.push(id)

	const scoreElement = document.querySelector(`#comment${id} .comment-score`);
	const newScore = parseInt(scoreElement.innerHTML) + 1
	scoreElement.innerHTML = newScore;

	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		for (let i = comments.length - 1; i >= 0; i--) {
			if(comments[i].replies.length !== 0) {
				for (let j = comments[i].replies.length - 1; j >= 0; j--) {
					if (comments[i].replies[j].id === id) {
						comments[i].replies[j].score = newScore;
						localStorage.setItem("comments", JSON.stringify(comments));
					}
				}
			}
		}
	} else {
		for (let i = comments.length - 1; i >= 0; i--) {
			if (comments[i].id === id) {
				comments[i].score = newScore;
				localStorage.setItem("comments", JSON.stringify(comments));
			}
		}
	}

}
const downvoteComment = (id) => {
	if (!voted.includes(id)) return;
	voted = voted.filter(item => item !== id);
	
	const scoreElement = document.querySelector(`#comment${id} .comment-score`);
	const newScore = parseInt(scoreElement.innerHTML) - 1;
	scoreElement.innerHTML = newScore;

	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		for (let i = comments.length - 1; i >= 0; i--) {
			if(comments[i].replies.length !== 0) {
				for (let j = comments[i].replies.length - 1; j >= 0; j--) {
					if (comments[i].replies[j].id === id) {
						comments[i].replies[j].score = newScore;
						localStorage.setItem("comments", JSON.stringify(comments));
					}
				}
			}
		}
	} else {
		for (let i = comments.length - 1; i >= 0; i--) {
			if (comments[i].id === id) {
				comments[i].score = newScore;
				localStorage.setItem("comments", JSON.stringify(comments));
			}
		}
	}

}

const update = (id) => {

	document.querySelector(`#comment${id} .edit .tool-text`).innerHTML = "Edit"

	document.querySelector(`#comment${id}`).classList.remove("editable");
	const newValue = document.querySelector(`#comment${id} .edit-input`).value;
	document.querySelector(`#comment${id} .comment-text`).innerHTML = newValue;

	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		for (let i = comments.length - 1; i >= 0; i--) {
			if(comments[i].replies.length !== 0) {
				for (let j = comments[i].replies.length - 1; j >= 0; j--) {
					if (comments[i].replies[j].id === id) {
						comments[i].replies[j].content = newValue;
						localStorage.setItem("comments", JSON.stringify(comments));
					}
				}
			}
		}
	} else {
		for (let i = comments.length - 1; i >= 0; i--) {
			if (comments[i].id === id) {
				comments[i].content = newValue;
				localStorage.setItem("comments", JSON.stringify(comments));
			}
		}
	}

}
const addReplyComment = (id) => {

	if (document.querySelector(`#input${id}`).value === "") {
		document.querySelector(`#form${id}`).remove();
		document.querySelector(`#comment${id} .reply .tool-text`).innerHTML = "Reply";
		return;
	};

	document.querySelector(`#comment${id} .reply .tool-text`).innerHTML = "Reply";

	const replyingTo = document.querySelector(`#comment${id} .sender-name`).innerHTML;
	const content = document.querySelector(`#input${id}`).value;
	lastCommentId++
	const commentObject = {
		id: lastCommentId,
		content: content,
		createdAt: "now",
		score: 0,
		replyingTo: replyingTo,
		user: currentUser
	}
	
	const newReply = createComment(commentObject, true, "reply");

	if (document.querySelector(`#comment${id}`).parentElement.classList.contains("replies-comments")) {
		document.querySelector(`#comment${id}`).parentElement.innerHTML += newReply;

		for (let i = comments.length - 1; i >= 0; i--) {
			if(comments[i].replies.length !== 0) {
				for (let j = comments[i].replies.length - 1; j >= 0; j--) {
					if (comments[i].replies[j].id === id) {
						comments[i].replies.push(commentObject);
						localStorage.setItem("comments", JSON.stringify(comments));
					}
				}
			}
		}

	} else {
		document.querySelector(`#group${id} .replies-comments`).innerHTML += newReply;
		
		for (let i = comments.length - 1; i >= 0; i--) {
			if (comments[i].id === id) {
				comments[i].replies.push(commentObject);
				localStorage.setItem("comments", JSON.stringify(comments));
			}
		}

	}
	document.querySelector(`#form${id}`).remove();
}	
const addComment = () => {
	if (document.querySelector(`.comment-input`).value === "") return;
	const content = document.querySelector(`.comment-input`).value;
	lastCommentId++
	const commentObject = {
		id: lastCommentId,
		content: content,
		createdAt: "now",
		score: 0,
		user: currentUser,
		replies: []
	}

	const newComment = createCommentReplyGroup(commentObject);

	document.querySelector(`#group${comments[comments.length - 1].id}`).insertAdjacentHTML('afterend', newComment);
	document.querySelector(".comment-input").value = "";

	comments.push(commentObject);

	localStorage.setItem("comments", JSON.stringify(comments));

	scroll()

}

const createReplyForm = (id) => `
<div class="form send-reply-form" id="form${id}">
	<textarea class="input reply-input" id="input${id}" placeholder="Add a comment..." name="reply input"></textarea>
	<img class="inputUserImage" src="" alt="user">
	<button class="btn send-btn" onClick="addReplyComment(${id})">send</button>
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
			${isYou ? `<textarea class="input edit-input" style="width: 100%;" placeholder="Add a comment..." name="comment input"></textarea>` : ''}
			<div class="vote">
				<button class="btn-vote upvote" onClick="upvoteComment(${group.id})">+</button>
				<span class="comment-score">${group.score}</span>
				<button class="btn-vote downvote" onClick="downvoteComment(${group.id})">-</button>
			</div>
			${isYou ? `<button class="btn update" onClick="update(${group.id})">update</button>` : ''}
			<div class="comment-tools">
			${isYou ? `
				<button class="comment-tool delete" onClick="showDeleteModal(${group.id})">
					<svg width="12" height="14" xmlns="http://www.w3.org/2000/svg">
						<path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z" 
						fill="currentColor"/></svg>
					<span class="tool-text">Delete</span>
				</button>
				<button class="comment-tool edit" onClick="editComment(${group.id})">
					<svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z" 
						fill="currentColor"/></svg>
					<span class="tool-text">Edit</span>
				</button> `
				: `
				<button class="comment-tool reply" onClick="replyComment(${group.id})">
						<svg width="14" height="13" xmlns="http://www.w3.org/2000/svg">
							<path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z" 
							fill="currentColor"/></svg>
					<span class="tool-text">Reply</span>
				</button>
				`
			}
			</div>
			
		</div>
		`;

		const createCommentReplyGroup = (group) => {
			if (lastCommentId < group.id) lastCommentId = group.id;
			let commentReplyGroup = `
			<div class="comment-replies-group" id="group${group.id}">
				${createComment(group, group.user.username === currentUser.username, "comment")}
				<div class="replies">
					<div class="replies-thread-line"></div>
					<ul class="replies-comments">
			`
			group.replies.forEach(reply => {
				commentReplyGroup += createComment(reply, reply.user.username === currentUser.username, "reply") 
				if (lastCommentId < reply.id) lastCommentId = reply.id;
			});

			commentReplyGroup +=`
					</ul>
				</div>
			</div>
			`;
			return commentReplyGroup;
		};

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
		comments = jsonData.comments;
		localStorage.setItem("comments", JSON.stringify(comments));
	} else {
		comments = JSON.parse(localComments);
	}
	
	document.querySelector(".inputUserImage").src = currentUser.image.webp;
	
	comments.forEach(comment => {
		commentsElement.innerHTML += createCommentReplyGroup(comment);
	});

	scroll();

});




