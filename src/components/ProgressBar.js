import React from 'react';

export default function ProgressBar({ progress }) {
  const styles = {
    container: {
      width: 400,
      padding: 10,
      margin: '10px 0',
      border: '1px solid #dadada',
      borderRadius: 5,
      backgroundColor: '#efefef',
    },
    bar: {
      width: progress + '%',
      height: 10,
      backgroundColor: 'green',
    },
  };

  return (
    <div style={styles.container}>
      <div className="progbar" style={styles.bar}></div>
    </div>
  );
}
