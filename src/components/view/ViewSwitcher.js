import React, { useEffect, useState } from 'react';

export default function ViewSwitcher({ views }) {
  const [viewIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewIndex]);

  return (
    <>
      {views[viewIndex].content}

    </>
  );
}
