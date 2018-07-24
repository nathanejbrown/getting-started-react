import * as React from "react";
import {connect} from "react-redux";
import Paper from "./Paper";
import LoadingPlaceholder from "./LoadingPlaceholder";
import AvatarHoverAction from "./AvatarHoverAction";
import {Users, KIRK} from "../Constants";
import {getAwayTeamIDs, addUserToAwayTeam, removeUserFromAwayTeam} from "../actions/AwayTeamActions";
import {stylesListToClassNames} from "../lib/Utils";

const classes = stylesListToClassNames({
    header: {textAlign: "center"},
    section: {display: "flex"},
    avatarPanel: {
        padding: "20px 30px 20px",
    },
    headerText: {
        fontSize: 20,
        padding: 10,
        textAlign: "center",
    },
    avatarList: {
        width: 400,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(110px, 1fr))",
        "-ms-grid-template-colums": "repeat(auto-fill,minmax(110px, 1fr))",
        "& > div": {margin: 5},
    },
    emptyAvatarList: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        width: 400,
        height: 235,
        border: "3px dashed #ccc",
    },
});

class AwayTeamManagement extends React.Component {
    constructor(props) {
        super(props);
        //Set initial state to loading to load the initial list of users in the away team
        this.state = {loading: true};
        props.getAwayTeamIDs(() => {
            this.setState({loading: false});
        });
    }

    addUser(id) {
        this.setState({loading: true});
        this.props.addUserToAwayTeam(id, () => {
            this.setState({loading: false});
        });
    }

    removeUser(id) {
        this.setState({loading: true});
        this.props.removeUserFromAwayTeam(id, () => {
            this.setState({loading: false});
        });
    }

    getCrewMemberList() {
        const crewList = Object.keys(Users)
            .map((userID) => Users[userID])
            //Don't display users who are within the away-team and also don't display Kirk as he's already the away team admin
            .filter((user) => this.props.awayTeamMembers.indexOf(user.id) === -1 && user.id !== KIRK)
            .sort((a, b) => a.id > b.id)
            .map((user) => (
                <AvatarHoverAction key={user.id} src={user.img} iconClasses="fas fa-plus" iconColor="#00BCD4" clickAction={() => this.addUser(user)} />
            ));
        return <div className={classes.avatarList}>{crewList}</div>;
    }

    getAwayTeamList() {
        if (this.props.awayTeamMembers.length === 0) {
            return (
                <div className={classes.emptyAvatarList}>
                    <div>Add crew members to the away team.</div>
                </div>
            );
        }
        const awayTeam = this.props.awayTeamMembers
            .sort((a, b) => a > b)
            .map((user) => (
                <AvatarHoverAction
                    key={Users[user].id}
                    src={Users[user].img}
                    iconClasses="fas fa-times"
                    iconColor="#D51819"
                    clickAction={() => this.removeUser(Users[user])}
                />
            ));

        return <div className={classes.avatarList}>{awayTeam}</div>;
    }

    render() {
        if (!this.props.isActiveAwayTeamAdmin) {
            return null;
        }
        if (this.state.loading) {
            return <LoadingPlaceholder />;
        }
        return (
            <div>
                <h2 className={classes.header}>Manage Away Team</h2>
                <div className={classes.section}>
                    <div className={classes.avatarPanel}>
                        <Paper>
                            <div className={classes.headerText}>Crew</div>
                            {this.getCrewMemberList()}
                        </Paper>
                    </div>
                    <div className={classes.avatarPanel}>
                        <Paper>
                            <div className={classes.headerText}>Away Team</div>
                            {this.getAwayTeamList()}
                        </Paper>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isActiveAwayTeamAdmin: state.awayTeam.admins.indexOf(state.activeUser.id) >= 0,
    awayTeamMembers: state.awayTeam.members,
});

export default connect(
    mapStateToProps,
    {getAwayTeamIDs, addUserToAwayTeam, removeUserFromAwayTeam}
)(AwayTeamManagement);