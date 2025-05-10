import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="header">
      <div className="logo-section">
        <img src="/smartmaple-logo.png" alt="smartmaple" />
      </div>
      <div className="profile-section">
        <div className="profile-info">
          <p className="profile-user">
            {profile?.name ?? AuthSession.getName()} -{" "}
            {profile?.role?.name ?? AuthSession.getRoles().name}
          </p>
          <p className="profile-email">
            {profile?.email ?? AuthSession.getEmail()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
