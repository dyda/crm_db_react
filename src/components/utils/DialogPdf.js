import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';

const DialogPdf = ({
  open,
  onClose,
  document,
  fileName = 'expenses.pdf',
  width = '100%',
  height = 750,
  downloadLabel = 'داگرتن',
  closeLabel = 'داخستن'
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <PDFViewer width={width} height={height}>
      {document}
    </PDFViewer>
    <DialogActions>
      <PDFDownloadLink document={document} fileName={fileName}>
        {({ loading }) =>
          loading ? (
            <Button variant="contained" disabled>
              Loading...
            </Button>
          ) : (
            <Button variant="contained" color="primary">
              {downloadLabel}
            </Button>
          )
        }
      </PDFDownloadLink>
      <Button variant="outlined" color="secondary" onClick={onClose}>
        {closeLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DialogPdf;