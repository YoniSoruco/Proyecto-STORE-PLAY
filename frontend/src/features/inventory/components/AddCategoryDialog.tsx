import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCategory } from '../inventorySlice';

interface AddCategoryDialogProps {
  open: boolean;
  onClose: (createdId?: number) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.inventory);
  const [name, setName] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    const result = await dispatch(createCategory(name.trim()));
    if (createCategory.fulfilled.match(result)) {
      setName('');
      onClose(result.payload.id);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth>
      <DialogTitle>Nueva Categoría</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading || !name.trim()}>
          {loading ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryDialog;
