import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface BulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (members: ParsedMember[]) => Promise<ImportResult>;
}

export interface ParsedMember {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  national_id: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  physical_address?: string;
  city?: string;
  country?: string;
  employer_name?: string;
  occupation?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; email: string; error: string }[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const REQUIRED_COLUMNS = ['first_name', 'last_name', 'email_address', 'phone_number', 'national_id', 'date_of_birth', 'gender'];
const OPTIONAL_COLUMNS = ['tier', 'physical_address', 'city', 'country', 'employer_name', 'occupation'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

const SAMPLE_CSV = `first_name,last_name,email_address,phone_number,national_id,date_of_birth,gender,tier,physical_address,city,country,employer_name,occupation
John,Doe,john.doe@example.com,+254712345678,12345678,1990-05-15,Male,BRONZE,123 Main St,Nairobi,Kenya,ABC Company,Engineer
Jane,Smith,jane.smith@example.com,+254723456789,23456789,1985-08-22,Female,SILVER,456 Oak Ave,Mombasa,Kenya,XYZ Corp,Manager
Michael,Johnson,michael.j@example.com,+254734567890,34567890,1992-12-10,Male,GOLD,789 Elm Rd,Kisumu,Kenya,Tech Ltd,Developer`;

export default function BulkImportDialog({ open, onClose, onImport }: BulkImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleClose = () => {
    // Reset state when closing
    setStep('upload');
    setParsedData([]);
    setValidationErrors([]);
    setImportResult(null);
    setImportProgress(0);
    setFileError(null);
    onClose();
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'member_import_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      rows.push(row);
    }

    return rows;
  };

  // Handle CSV values with commas inside quotes
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  };

  const validateData = (data: Record<string, string>[]): { valid: ParsedMember[]; errors: ValidationError[] } => {
    const valid: ParsedMember[] = [];
    const errors: ValidationError[] = [];
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const seenNationalIds = new Set<string>();

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because header is row 1, and index is 0-based
      const rowErrors: ValidationError[] = [];

      // Check required fields
      REQUIRED_COLUMNS.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          rowErrors.push({ row: rowNumber, field, message: `${field} is required` });
        }
      });

      // Validate email format
      const email = row.email_address?.toLowerCase().trim();
      if (email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          rowErrors.push({ row: rowNumber, field: 'email_address', message: 'Invalid email format' });
        } else if (seenEmails.has(email)) {
          rowErrors.push({ row: rowNumber, field: 'email_address', message: 'Duplicate email in file' });
        } else {
          seenEmails.add(email);
        }
      }

      // Validate phone number
      const phone = row.phone_number?.trim();
      if (phone) {
        if (!/^[\+]?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))) {
          rowErrors.push({ row: rowNumber, field: 'phone_number', message: 'Invalid phone format' });
        } else if (seenPhones.has(phone)) {
          rowErrors.push({ row: rowNumber, field: 'phone_number', message: 'Duplicate phone in file' });
        } else {
          seenPhones.add(phone);
        }
      }

      // Validate national ID
      const nationalId = row.national_id?.trim();
      if (nationalId) {
        if (seenNationalIds.has(nationalId)) {
          rowErrors.push({ row: rowNumber, field: 'national_id', message: 'Duplicate National ID in file' });
        } else {
          seenNationalIds.add(nationalId);
        }
      }

      // Validate date of birth
      const dob = row.date_of_birth?.trim();
      if (dob) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
          rowErrors.push({ row: rowNumber, field: 'date_of_birth', message: 'Date must be YYYY-MM-DD format' });
        } else {
          const date = new Date(dob);
          if (isNaN(date.getTime())) {
            rowErrors.push({ row: rowNumber, field: 'date_of_birth', message: 'Invalid date' });
          }
        }
      }

      // Validate gender
      const gender = row.gender?.trim();
      if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        rowErrors.push({ row: rowNumber, field: 'gender', message: 'Gender must be Male, Female, or Other' });
      }

      // Validate tier if provided
      const tier = row.tier?.trim().toUpperCase();
      if (tier && !['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(tier)) {
        rowErrors.push({ row: rowNumber, field: 'tier', message: 'Tier must be BRONZE, SILVER, GOLD, or PLATINUM' });
      }

      if (rowErrors.length === 0) {
        valid.push({
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          email_address: email!,
          phone_number: phone!,
          national_id: nationalId!,
          date_of_birth: dob!,
          gender: gender as 'Male' | 'Female' | 'Other',
          tier: (tier as 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM') || 'BRONZE',
          physical_address: row.physical_address?.trim() || undefined,
          city: row.city?.trim() || 'Nairobi',
          country: row.country?.trim() || 'Kenya',
          employer_name: row.employer_name?.trim() || undefined,
          occupation: row.occupation?.trim() || undefined,
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    return { valid, errors };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);

    if (!file.name.endsWith('.csv')) {
      setFileError('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFileError('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rawData = parseCSV(text);

      if (rawData.length === 0) {
        setFileError('No data found in CSV file');
        return;
      }

      if (rawData.length > 500) {
        setFileError('Maximum 500 members per import. Please split your file.');
        return;
      }

      const { valid, errors } = validateData(rawData);
      setParsedData(valid);
      setValidationErrors(errors);
      setStep('preview');
    };

    reader.onerror = () => {
      setFileError('Failed to read file');
    };

    reader.readAsText(file);
    
    // Reset file input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setStep('importing');
    setImportProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await onImport(parsedData);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);
      setStep('results');
    } catch (error: any) {
      setStep('results');
      setImportResult({
        success: 0,
        failed: parsedData.length,
        errors: [{ row: 0, email: '', error: error.message || 'Import failed' }],
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: 400 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {step === 'upload' && 'Bulk Import Members'}
          {step === 'preview' && 'Review Import Data'}
          {step === 'importing' && 'Importing Members...'}
          {step === 'results' && 'Import Results'}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Upload Step */}
        {step === 'upload' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Upload a CSV file with member data. Required columns: 
                <strong> first_name, last_name, email_address, phone_number, national_id, date_of_birth, gender</strong>
              </Typography>
            </Alert>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                backgroundColor: 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.selected',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CSV file up to 5MB (max 500 members)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            {fileError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {fileError}
              </Alert>
            )}

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Need a template?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download our sample CSV file with the correct format
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  startIcon={<DownloadIcon />}
                  onClick={downloadSampleCSV}
                >
                  Download Template
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Column Reference
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Column Name</TableCell>
                      <TableCell>Required</TableCell>
                      <TableCell>Format / Example</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><code>first_name</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>John</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>last_name</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>Doe</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>email_address</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>john@example.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>phone_number</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>+254712345678</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>national_id</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>12345678</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>date_of_birth</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>YYYY-MM-DD (e.g., 1990-05-15)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>gender</code></TableCell>
                      <TableCell><Chip label="Required" size="small" color="error" /></TableCell>
                      <TableCell>Male / Female / Other</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>tier</code></TableCell>
                      <TableCell><Chip label="Optional" size="small" /></TableCell>
                      <TableCell>BRONZE / SILVER / GOLD / PLATINUM</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>physical_address</code></TableCell>
                      <TableCell><Chip label="Optional" size="small" /></TableCell>
                      <TableCell>123 Main Street</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>city</code></TableCell>
                      <TableCell><Chip label="Optional" size="small" /></TableCell>
                      <TableCell>Nairobi (default)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><code>country</code></TableCell>
                      <TableCell><Chip label="Optional" size="small" /></TableCell>
                      <TableCell>Kenya (default)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <Box>
            {/* Summary */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Alert 
                severity={parsedData.length > 0 ? 'success' : 'warning'} 
                icon={<SuccessIcon />}
                sx={{ flex: 1 }}
              >
                <strong>{parsedData.length}</strong> valid records ready to import
              </Alert>
              {validationErrors.length > 0 && (
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{ flex: 1 }}
                >
                  <strong>{validationErrors.length}</strong> validation errors (will be skipped)
                </Alert>
              )}
            </Stack>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'warning.main' }}>
                  Validation Errors (these rows will be skipped):
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 150, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Field</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validationErrors.slice(0, 20).map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{err.row}</TableCell>
                          <TableCell><code>{err.field}</code></TableCell>
                          <TableCell>{err.message}</TableCell>
                        </TableRow>
                      ))}
                      {validationErrors.length > 20 && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="text.secondary">
                              ... and {validationErrors.length - 20} more errors
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Valid Data Preview */}
            {parsedData.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preview of members to import:
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Tier</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedData.slice(0, 50).map((member, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{member.first_name} {member.last_name}</TableCell>
                          <TableCell>{member.email_address}</TableCell>
                          <TableCell>{member.phone_number}</TableCell>
                          <TableCell>
                            <Chip label={member.tier || 'BRONZE'} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                      {parsedData.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              ... and {parsedData.length - 50} more members
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Importing {parsedData.length} members...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please wait while we process your data. This may take a few moments.
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={importProgress} 
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {importProgress}% complete
            </Typography>
          </Box>
        )}

        {/* Results Step */}
        {step === 'results' && importResult && (
          <Box>
            {/* Overall Result */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {importResult.success > 0 && importResult.failed === 0 ? (
                <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              ) : importResult.success === 0 ? (
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              ) : (
                <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              )}
              <Typography variant="h5" gutterBottom>
                Import {importResult.success > 0 ? 'Complete' : 'Failed'}
              </Typography>
            </Box>

            {/* Stats */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" color="success.main">{importResult.success}</Typography>
                <Typography variant="body2" color="text.secondary">Imported</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                <Typography variant="h4" color="error.main">{importResult.failed}</Typography>
                <Typography variant="body2" color="text.secondary">Failed</Typography>
              </Paper>
            </Stack>

            {/* Error Details */}
            {importResult.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main' }}>
                  Failed Records:
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResult.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{err.email || 'N/A'}</TableCell>
                          <TableCell>{err.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {importResult.success > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                A welcome email has been sent to each new member with instructions to set up their password.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 'upload' && (
          <Button onClick={handleClose}>Cancel</Button>
        )}

        {step === 'preview' && (
          <>
            <Button onClick={() => setStep('upload')}>
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleImport}
              disabled={parsedData.length === 0}
            >
              Import {parsedData.length} Members
            </Button>
          </>
        )}

        {step === 'importing' && (
          <Button disabled>Please wait...</Button>
        )}

        {step === 'results' && (
          <>
            {importResult && importResult.failed > 0 && importResult.success > 0 && (
              <Button onClick={() => setStep('upload')}>
                Import More
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
