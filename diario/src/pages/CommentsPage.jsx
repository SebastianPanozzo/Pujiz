import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, List, message, Popconfirm } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

const CommentsPage = () => {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [form] = Form.useForm();
  const [trabajadorId, setTrabajadorId] = useState(null);
  const [trabajadorNombre, setTrabajadorNombre] = useState(null); // Nuevo estado para el nombre del trabajador

  useEffect(() => {
    fetchComments();
    verifyTrabajador();

    const handleKeyDown = (event) => {
      if (event.key === 'F12') {
        console.log('ID del trabajador:', trabajadorId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [trabajadorId, id]);

  const fetchComments = async () => {
    try {
      console.log(`Fetching comments for ID: ${id}`); // Debug log
      const url = `http://127.0.0.1:8000/diarioback/noticias/${id}/comentarios/`;
      console.log(`Request URL: ${url}`); // Debug log
      const response = await axios.get(url);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('Failed to fetch comments');
    }
  };

  const verifyTrabajador = async () => {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
      return; // Optionally redirect or handle error
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/diarioback/user-profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.data.trabajador) {
        setTrabajadorId(response.data.id);
        setTrabajadorNombre(`${response.data.nombre} ${response.data.apellido}`); // Asigna el nombre completo del trabajador
      }
    } catch (error) {
      console.error('Error verifying trabajador:', error);
    }
  };

  const onFinish = async (values) => {
    try {
      await axios.post(`http://127.0.0.1:8000/diarioback/noticias/${id}/comentarios/`, {
        noticia: id,
        contenido: values.comment,
        autor: trabajadorId || 'Anonymous', // Cambiar esto para usar trabajadorId
      });
      message.success('Comment added successfully');
      form.resetFields();
      fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/diarioback/noticias/${id}/comentarios/${commentId}/`);
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      message.error('Failed to delete comment');
    }
  };

  return (
    <div>
      <h1>Comments for News ID: {id}</h1>
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="comment" rules={[{ required: true, message: 'Please enter a comment' }]}>
          <TextArea rows={4} placeholder="Add your comment..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Comment
          </Button>
        </Form.Item>
      </Form>
      <List
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={item => (
          <List.Item
            actions={[
              <Popconfirm
                title="Are you sure to delete this comment?"
                onConfirm={() => handleDelete(item.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger>Delete</Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={trabajadorNombre ? `${trabajadorNombre} (ID: ${trabajadorId})` : 'Anonymous'} // Mostrar el nombre y el ID
              description={item.contenido}
            />
            <div>{new Date(item.fecha_creacion).toLocaleString()}</div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommentsPage;


