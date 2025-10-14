import { SRSGame } from '../../../components';

const StudyTab = ({ manga }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Study</h2>
      <SRSGame manga={manga} />
    </div>
  );
};

export default StudyTab;