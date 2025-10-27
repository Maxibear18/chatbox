import React, { useEffect, useRef } from 'react';
import './App.css';
import {
    ListItemText, ListItemAvatar, MenuItem, Divider,
    Avatar, IconButton, Button, TextField, Popper, Fade, Typography, ListItemIcon,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Session } from './types'
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import StyledMenu from './StyledMenu';

const { useState } = React

export interface Props {
    session: Session
    selected: boolean
    switchMe: () => void
    deleteMe: () => void
    copyMe: () => void
    editMe: () => void
    index: number
    draggedSessionIndex: number | null
    onDragStart?: (index: number) => void
    onDragEnd?: () => void
    onDragOver?: (index: number, clientY: number) => void
    onDrop?: (targetIndex: number) => void
}

export default function SessionItem(props: Props) {
    const { session, selected, switchMe, deleteMe, copyMe, editMe, index, draggedSessionIndex, onDragStart, onDragEnd, onDragOver, onDrop } = props
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
        if (onDragStart) {
            onDragStart(index)
        }
    }

    const handleDragEnd = () => {
        if (onDragEnd) {
            onDragEnd()
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (onDragOver) {
            onDragOver(index, e.clientY)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (onDrop) {
            onDrop(index)
        }
    }

    return (
        <MenuItem
            key={session.id}
            id={`session-${index}`}
            selected={selected}
            onClick={() => switchMe()}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={draggedSessionIndex === index ? "draggable-session-item dragging" : "draggable-session-item"}
        >
            <ListItemIcon>
                <IconButton><ChatBubbleOutlineOutlinedIcon fontSize="small" /></IconButton>
            </ListItemIcon>
            <ListItemText>
                <Typography variant="inherit" noWrap>
                    {session.name}
                </Typography>
            </ListItemText>
            <IconButton onClick={handleClick}>
                <MoreHorizOutlinedIcon />
            </IconButton>
            <StyledMenu
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem key={session.id + 'edit'} onClick={() => {
                    editMe()
                    handleClose()
                }} disableRipple>
                    <EditIcon />
                    Rename
                </MenuItem>

                <MenuItem key={session.id + 'copy'} onClick={() => {
                    copyMe()
                    handleClose()
                }} disableRipple>
                    <FileCopyIcon fontSize='small' />
                    Copy
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem key={session.id + 'del'} onClick={() => {
                    setAnchorEl(null)
                    handleClose()
                    deleteMe()
                }} disableRipple
                >
                    <DeleteForeverIcon />
                    Delete
                </MenuItem>

            </StyledMenu>
        </MenuItem>
    )
}
