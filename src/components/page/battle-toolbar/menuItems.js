import React from 'react';
import ShareIcon from '../../icons/ShareIcon';
import RulesSearchMenuIcon from '../../icons/RulesSearchMenuIcon';
import RemoveIcon from '../../icons/RemoveIcon';

const searchRules = (onClick, rulesSearchOpen) => ({
  icon: <RulesSearchMenuIcon opened={rulesSearchOpen} />,
  label: rulesSearchOpen ? 'Close search' : 'Search rules',
  ref: React.createRef(),
  onClick,
});

export const dmItems = (
  battleManager,
  shareEnabled,
  rulesSearchOpen,
  toggleRulesSearch,
) => {
  const menuItems1 = [
    searchRules(toggleRulesSearch, rulesSearchOpen),
    {
      icon: <ShareIcon enabled={shareEnabled} />,
      label: shareEnabled ? 'Unshare battle' : 'Share battle',
      ref: React.createRef(),
      onClick: battleManager.toggleShare,
    },
  ];

  const menuItems2 = [
    {
      icon: <RemoveIcon />,
      label: 'Reset battle',
      ref: React.createRef(),
      onClick: battleManager.resetBattle,
      confirm: true,
      message: (
        <>
          Are you sure you want to reset the battle?
          <br />
          This will remove all unlocked creatures and reset all initiative rolls.
        </>
      ),
    },
  ];

  return [...menuItems1, ...menuItems2];
};

export const playerItems = (rulesSearchOpen, toggleRulesSearch) => ([
  searchRules(toggleRulesSearch, rulesSearchOpen),
]);
