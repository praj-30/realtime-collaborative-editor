import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';

const SAVE_INTERVAL_MS = 2000;

const Editor = () => {
  const editorRef = useRef();
  const socketRef = useRef();
  const quillRef = useRef();

  useEffect(() => {
    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    const quill = new Quill(editorRef.current, {
      theme: 'snow',
    });
    quill.disable();
    quill.setText('Loading...');
    quillRef.current = quill;

    socket.once('load-document', document => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', 'doc-id-1');

    const handleChange = (delta, oldDelta, source) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };

    quill.on('text-change', handleChange);

    socket.on('receive-changes', delta => {
      quill.updateContents(delta);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div ref={editorRef} style={{ height: '90vh' }} />;
};

export default Editor;

