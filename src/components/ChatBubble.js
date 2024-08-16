export const LeftBubble = (props) => (
 <div style={{backgroundColor:'#fff', maxWidth:'300px', borderRadius:'10px 10px 10px 0px',
  color: '#000', padding: '6px'}}>
  {props.children}
 </div>
)

export const RightBubble = (props) => (
  <div style={{backgroundColor:'#000', maxWidth:'300px', borderRadius:'10px 0px 10px 10px',
    color: '#fff', padding: '6px'}}>
  {props.children}
  </div>
 )