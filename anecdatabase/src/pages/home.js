import React from "react";
import ReactDOM from "react-dom";

export default function Home() {
  return (
    <div className="home-background">
      <form className="form">
        <div>
          <p className="welcome">We are welcome together.</p>
          <p className="welcome-greeting">
            We understand the importance of reconnecting with friends, family,
            and colleagues, and we're here to make the entire planning process a
            breeze. Whether you're organizing a class reunion, a family
            get-together, or a corporate event, our user-friendly interface and
            powerful features are designed to simplify every step.
          </p>
        </div>
      </form>
    </div>
  );
}

ReactDOM.render(<Home />, document.getElementById("root"));