import ActivityFeed from "../../../components/ActivityFeed";

const ActivityTab = () => {
  return (
    <div className="p-2 pb-4 rounded-[16px]">
      <h2 className="text-xl font-bold mb-6">Activity</h2>
      <ActivityFeed> </ActivityFeed>
     
    </div>
  );
};

export default ActivityTab;
