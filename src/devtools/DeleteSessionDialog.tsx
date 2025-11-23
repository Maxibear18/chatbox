import './App.css';
import {
    Button, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText,
} from '@mui/material';
import { Session } from './types'

interface Props {
    open: boolean
    session: Session
    onConfirm(): void
    onCancel(): void
}

export default function DeleteSessionDialog(props: Props) {
    const handleDelete = () => {
        props.onConfirm()
    }

    return (
        <Dialog open={props.open} onClose={props.onCancel}>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete the session "{props.session.name}"? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={handleDelete} color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    )
}

