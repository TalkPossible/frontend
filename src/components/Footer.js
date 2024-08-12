import React from 'react';

import "./Footer.css";

const Footer = () => {

  return (
    <>
      <div className="footer">
        <div className="team-info">
          <div id="name-team">TalkMate</div>
          <div id="name-project">TalkPossible</div>
          <div className="team-member">
            <div>
              이유종<br/>
              신정윤<br/>
              정은채<br/>
              양희정<br/>
              김수연<br/>
            </div>
            <div>
              PM 백엔드 AI<br/>
              백엔드 AI<br/>
              프론트엔드 AI<br/>
              프론트엔드 AI<br/>
              AI 리더<br/>
            </div>
          </div>
        </div>
        <div className="etc">
          <div className="sns">
            <div id="sns-title">Social Media</div>
            <div className="link">
              <img src="/images/sns/instagram.png" alt="instagram" />
              <img src="/images/sns/facebook.png" alt="facebook" />
              <img src="/images/sns/youtube.png" alt="youtube" />
            </div>
          </div>
          <div className="copyrights">
            <div id="copyright-title">copyrights</div>
            <div>
              <a href="https://kr.freepik.com">Freepik</a> <br/>
              <a href="https://www.flaticon.com">Flaticon</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;