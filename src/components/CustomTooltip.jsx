import { Tooltip } from '@mantine/core';
import PropTypes from 'prop-types';

export function CustomTooltip({
  label,
  children,
  position = 'top',
  withArrow = true,
  arrowSize = 6,
  color = 'dark',
  multiline = false,
  w,
  transitionProps = { transition: 'scale', duration: 200 },
  openDelay = 0,
  closeDelay = 0,
  events = { hover: true, focus: false, touch: false },
  floating = false,
  ...props
}) {
  const TooltipComponent = floating ? Tooltip.Floating : Tooltip;

  const finalTransitionProps = floating ? { transition: 'pop', duration: 250 } : transitionProps;

  return (
    <TooltipComponent
      label={label}
      position={floating ? undefined : position}
      withArrow={withArrow}
      arrowSize={arrowSize}
      color={color}
      multiline={multiline}
      w={w}
      transitionProps={finalTransitionProps}
      openDelay={openDelay}
      closeDelay={closeDelay}
      events={events}
      {...props}
    >
      {children}
    </TooltipComponent>
  );
}

CustomTooltip.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf([
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
    'right',
    'right-start',
    'right-end',
  ]),
  withArrow: PropTypes.bool,
  arrowSize: PropTypes.number,
  color: PropTypes.string,
  multiline: PropTypes.bool,
  w: PropTypes.number,
  transitionProps: PropTypes.shape({
    transition: PropTypes.string,
    duration: PropTypes.number,
  }),
  openDelay: PropTypes.number,
  closeDelay: PropTypes.number,
  events: PropTypes.shape({
    hover: PropTypes.bool,
    focus: PropTypes.bool,
    touch: PropTypes.bool,
  }),
  floating: PropTypes.bool,
};
