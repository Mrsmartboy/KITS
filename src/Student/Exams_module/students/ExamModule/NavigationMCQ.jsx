import CountdownTimer from "./CountdownTimer";
import { NumberedNavigation } from "./NumberedNavigation";

export const NavigationMCq = ({ safeSubmit }) => {
  return (
    <div className="rounded-xl flex flex-col mr-2">
      <CountdownTimer safeSubmit={safeSubmit} />
      <NumberedNavigation />
    </div>
  );
};
