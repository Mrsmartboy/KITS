import React from 'react';

const rows = [
  {
    sno: '001',
    question: 'Write a Program print addition of 2 numbers',
    difficulty: 'Easy',
    testPassed: 4,
    testTotal: 4,
    scorePassed: 10,
    scoreTotal: 20,
    status: 'In progress',
  },
  {
    sno: '002',
    question: 'Write a Program print addition of 2 numbers',
    difficulty: 'Easy',
    testPassed: 2,
    testTotal: 4,
    scorePassed: 6,
    scoreTotal: 10,
    status: 'Solved',
  },
  // …add the rest here…
];

const NewSubTopicsFigma = () => {
  const colStyle = { gridTemplateColumns: '5% 30% 10% 20% 20% 10%' };

  return (
    <div className="p-4 min-h-screen bg-gray-50 font-[Inter]">
      {/* Table on md+ */}
      <div
        className="hidden md:block w-full bg-white rounded-sm"
        style={{ boxShadow: '0px 5px 21px rgba(0,73,198,0.2)' }}
      >
        {/* Header */}
        <div
          className="grid text-white font-semibold text-[15px] leading-[19px] rounded-t-md bg-[#19216F]"
          style={colStyle}
        >
          <div className="py-3 px-4">S/No</div>
          <div className="py-3 px-4">Question</div>
          <div className="py-3 px-4">Difficulty</div>
          <div className="py-3 px-4">Test Cases</div>
          <div className="py-3 px-4">Score</div>
          <div className="py-3 px-4">Status</div>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <div
            key={row.sno}
            className={`grid text-[15px] leading-[19px] ${
              idx % 2 === 0 ? 'bg-[#EEEFFF]' : 'bg-white'
            }`}
            style={colStyle}
          >
            <div className="py-3 px-4 font-medium">{row.sno}</div>
            <div className="py-3 px-4">{row.question}</div>
            <div className="py-3 px-4">{row.difficulty}</div>

            <div className="py-3 px-4">
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#2333CB]"
                  style={{
                    width: `${(row.testPassed / row.testTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 font-semibold text-[12px] leading-[15px] text-[#19216F]">
                {row.testPassed}/{row.testTotal}
              </div>
            </div>

            <div className="py-3 px-4">
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#2333CB]"
                  style={{
                    width: `${(row.scorePassed / row.scoreTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 font-semibold text-[10px] leading-[12px] text-[#19216F]">
                {row.scorePassed}/{row.scoreTotal}
              </div>
            </div>

            <div className="py-3 px-4">{row.status}</div>
          </div>
        ))}
      </div>

      {/* Cards on <md */}
      <div className="md:hidden flex flex-col space-y-4">
        {rows.map((row) => (
          <div
            key={row.sno}
            className="bg-white rounded-sm p-4"
            style={{ boxShadow: '0px 5px 21px rgba(0,73,198,0.2)' }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-[15px]">#{row.sno}</span>
              <span className="text-[12px] font-semibold text-[#19216F]">
                {row.status}
              </span>
            </div>
            <div className="mb-2 text-[15px]">{row.question}</div>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <span className="bg-[#EEEFFF] px-2 py-1 rounded text-[12px]">
                {row.difficulty}
              </span>
            </div>
            <div className="mb-2">
              <div className="text-[12px] font-semibold mb-1">
                Test Cases Passed
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#2333CB]"
                  style={{
                    width: `${(row.testPassed / row.testTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px]">{row.testPassed}/{row.testTotal}</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold mb-1">Score</div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#2333CB]"
                  style={{
                    width: `${(row.scorePassed / row.scoreTotal) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px]">{row.scorePassed}/{row.scoreTotal}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewSubTopicsFigma;
