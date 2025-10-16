import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

export const openDeleteConfirmation = (itemName, itemType = 'item', onConfirm) => {
  modals.openConfirmModal({
    children: (
      <Text size="sm">
        Are you sure you want to delete the {itemType} <strong>"{itemName}"</strong>? This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    groupProps: { justify: 'center' },
    centered: true,
    radius: '24px',
    size: 'sm',
    padding: '24px',
    onConfirm,
    title: null,
    withCloseButton: false,
  });
};

export default openDeleteConfirmation;
