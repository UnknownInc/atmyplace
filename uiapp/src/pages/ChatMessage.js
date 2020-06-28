import React,{useState, useRef, useEffect} from 'react';
import moment from 'moment';
import {observer} from 'mobx-react';
import {useStores} from '../hooks';
import { Comment, Tooltip, Avatar } from 'antd';
import {
  DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled,
} from '@ant-design/icons';

const ChatMessage=(props)=>{
  const {data} = props;
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState(null);

  const like = () => {
    setLikes(1);
    setDislikes(0);
    setAction('liked');
  };

  const dislike = () => {
    setLikes(0);
    setDislikes(1);
    setAction('disliked');
  };

  const actions = [
    <span key="comment-basic-like">
      <Tooltip title="Like">
        {React.createElement(action === 'liked' ? LikeFilled : LikeOutlined, {
          onClick: like,
        })}
      </Tooltip>
      <span className="comment-action">{likes}</span>
    </span>,
    <span key=' key="comment-basic-dislike"'>
      <Tooltip title="Dislike">
        {React.createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined, {
          onClick: dislike,
        })}
      </Tooltip>
      <span className="comment-action">{dislikes}</span>
    </span>,
    <span key="comment-basic-reply-to">Reply to</span>,
  ];
  const renderMessage=()=>{
    return <Comment
      actions={actions}
      author={<a>{data.from.displayName}</a>}
      avatar={
        <Avatar
          src={data.from.photoURL}
          alt={data.from.displayName}
        />
      }
      content={
        <p>{data.message}</p>
      }
      datetime={
        <Tooltip title={moment(data.time).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{moment(data.time).fromNow()}</span>
        </Tooltip>
      }
    />
  }

  let content;

  switch(data.type) {
    case 'STATUS':
      content=<div style={{paddingTop:8, paddingBottom:8}}><Avatar src={data.from.photoURL} alt={data.from.displayName}/>
        &nbsp;&nbsp;{data.from.displayName}&nbsp;{data.message}</div>
      break;
    default:
      content=renderMessage();
  }
  return (<div style={{background:'white', borderRadius:4, overflow:'hidden', color:'black', 
    animation: "slide-up 0.4s ease, zoom-out 0.4s ease",
    marginBottom:8, paddingLeft:8, paddingRight:8}}>
    {content}
  </div>);
}

export default ChatMessage;