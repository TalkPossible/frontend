import "../assets/css/ChatBubble.css";

export const LeftBubble = (props) => (
 <div className="bubble bubble-1st" >
  {props.children}
 </div>
)

export const RightBubble = (props) => (
  <div className="bubble bubble-2nd" >
  {props.children}
  </div>
 )