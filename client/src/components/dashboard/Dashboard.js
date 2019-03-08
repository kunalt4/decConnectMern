import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getCurrentProfile, deleteAccount } from "../../actions/profileAction";
import Spinner from "../common/Spinner";
import ProfileActions from "./ProfileActions";
import Experience from "./Experience";
import Education from "./Education";

class Dashboard extends Component {
  componentDidMount() {
    this.props.getCurrentProfile();
  }

  onDeleteClick = e => {
    this.props.deleteAccount();
  };

  render() {
    const { user } = this.props.auth;
    const { profile, loading } = this.props.profile;

    let dashBoardContent;
    if (profile === null || loading) {
      dashBoardContent = <Spinner />;
    } else {
      //Check if profile data exits for user
      if (Object.keys(profile).length > 0) {
        dashBoardContent = (
          <div>
            <p className="lead text-muted">
              Welcome{" "}
              <Link to={"/profile/" + profile.handle}> {user.name}! </Link>
            </p>
            <ProfileActions />
            <Experience experience={profile.experience} />
            <Education education={profile.education} />
            <div style={{ marginBottom: "60px" }} />
            <button onClick={this.onDeleteClick} className="btn btn-danger">
              Delete Account!
            </button>
          </div>
        );
      } else {
        //User logged in but no profile
        dashBoardContent = (
          <div>
            <p className="lead text-muted">Welcome {user.name}! </p>
            <p>You have not setup a profile yet. Set it up!</p>
            <Link to="/create-profile" className="btn btn-lg btn-info">
              Create Profile
            </Link>
          </div>
        );
      }
    }
    return (
      <div className="dashboard">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4">Dashboard</h1> {dashBoardContent}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { getCurrentProfile, deleteAccount }
)(Dashboard);
