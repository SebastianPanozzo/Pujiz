import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Modal, message, Select, Checkbox, Input, DatePicker, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import './NewsManagement.css'; // Import the CSS file
const { Option } = Select;
const { TextArea } = Input;

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [editors, setEditors] = useState([]);
  const [publicationStates, setPublicationStates] = useState([]);
  const [filteredPublicationStates, setFilteredPublicationStates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [trabajadorId, setTrabajadorId] = useState(null);
  const navigate = useNavigate();
  
  const sectionOptions = [
    'Portada',
    'Política',
    'Economía',
    'Cultura y sociedad',
    'Mundo',
  ];

  useEffect(() => {
    fetchNews();
    fetchEditors();
    fetchPublicationStates();
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
  }, [trabajadorId]);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/diarioback/noticias/');
      const filteredNews = response.data
        .filter(noticia => 
          noticia.autor === trabajadorId || noticia.editor_en_jefe === trabajadorId
        )
        .sort((a, b) => moment(b.fecha_publicacion).diff(moment(a.fecha_publicacion))); // Ordena por fecha
  
      setNews(filteredNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      message.error('Failed to fetch news');
    }
  };
  

  const fetchEditors = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/diarioback/trabajadores/');
      setEditors(response.data);
    } catch (error) {
      console.error('Failed to fetch editors:', error);
      message.error('Failed to fetch editors');
    }
  };

  const fetchPublicationStates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/diarioback/estados-publicacion/');
      setPublicationStates(response.data);
    } catch (error) {
      console.error('Failed to fetch publication states:', error);
      message.error('Failed to fetch publication states');
    }
  };

  const verifyTrabajador = async () => {
    const accessToken = localStorage.getItem('access');

    if (!accessToken) {
      navigate('/home');
      return;
    }

    try {
      const response = await axios.get('http://127.0.0.1:8000/diarioback/user-profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.data.trabajador) {
        navigate('/home');
        return;
      }

      setTrabajadorId(response.data.id);
    } catch (error) {
      console.error('Error verifying trabajador:', error);
      navigate('/home');
    }
  };

  const showModal = (record = null) => {
    if (record) {
      const secciones = [record.seccion1, record.seccion2, record.seccion3, record.seccion4, record.seccion5, record.seccion6].filter(Boolean);
      form.setFieldsValue({
        ...record,
        fecha_publicacion: moment(record.fecha_publicacion),
        solo_para_subscriptores: record.solo_para_subscriptores || false,
        tags: record.tags || '',
        secciones: secciones,
        estado: record.estado ? parseInt(record.estado, 10) : undefined,
      });
      setEditingId(record.id);

      // Filter states based on user role for this specific news item
      if (trabajadorId === record.autor) {
        // If current user is the author, exclude "publicado" state
        setFilteredPublicationStates(publicationStates.filter(state => state.nombre_estado !== 'publicado'));
      } else if (trabajadorId === record.editor_en_jefe) {
        // If current user is the editor-in-chief, show all states including "publicado"
        setFilteredPublicationStates(publicationStates);
      } else {
        // If current user is neither author nor editor-in-chief, show no states
        setFilteredPublicationStates([]);
      }
    } else {
      // For creating a new news item
      form.resetFields();
      setEditingId(null);
      // When creating a new item, assume current user is the author, so exclude "publicado"
      setFilteredPublicationStates(publicationStates.filter(state => state.nombre_estado !== 'publicado'));
    }
    setIsModalVisible(true);
  };
  const handleOk = async () => {
    // Siempre cierra el modal después de la validación del formulario
    const values = await form.validateFields().catch((info) => {
      console.log('Form validation failed:', info);
      return null; // Devuelve null si la validación falla
    });
  
    if (!values) {
      return; // Si la validación falla, simplemente sale de la función
    }
  
    const secciones = values.secciones || [];
    const noticiaEditada = {
      nombre_noticia: values.nombre_noticia,
      fecha_publicacion: values.fecha_publicacion.format('YYYY-MM-DD'),
      seccion1: secciones[0] || '',
      seccion2: secciones[1] || '',
      seccion3: secciones[2] || '',
      seccion4: secciones[3] || '',
      seccion5: secciones[4] || '',
      seccion6: secciones[5] || '',
      tags: values.tags || '',
      autor: parseInt(values.autor, 10),
      editor_en_jefe: parseInt(values.editor_en_jefe, 10),
      estado: parseInt(values.estado, 10),
      solo_para_subscriptores: values.solo_para_subscriptores || false,
      contenido: values.contenido,
    };
  
    console.log('Valores del formulario:', values);
    console.log('noticiaEditada:', noticiaEditada);
  
    if (!noticiaEditada.autor) {
      message.error('El campo Autor no puede estar vacío o inválido');
      setIsModalVisible(false); // Cierra el modal incluso si hay un error
      await fetchNews(); // Recarga las noticias
      return;
    }
  
    try {
      let response;
      if (editingId) {
        response = await axios.put(`http://127.0.0.1:8000/diarioback/noticias/${editingId}/`, noticiaEditada);
        console.log('Respuesta del servidor después de actualizar:', response.data);
  
        setNews(prevNews => prevNews.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              ...response.data,
              autor: response.data.autor,
              editor_en_jefe: response.data.editor_en_jefe,
              secciones: [
                response.data.seccion1,
                response.data.seccion2,
                response.data.seccion3,
                response.data.seccion4,
                response.data.seccion5,
                response.data.seccion6
              ].filter(Boolean),
              fecha_publicacion: moment(response.data.fecha_publicacion),
              estado: parseInt(response.data.estado, 10),
            };
          }
          return item;
        }));
      } else {
        response = await axios.post('http://127.0.0.1:8000/diarioback/noticias/', noticiaEditada);
        setNews(prevNews => [...prevNews, response.data]);
      }
  
      message.success(editingId ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente');
    } catch (error) {
      console.error('Error al crear/actualizar noticia:', error);

    } finally {
      setIsModalVisible(false); // Cierra el modal al final de la función
      await fetchNews(); // Recarga las noticias al finalizar
    }
  };
  
  
  
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/diarioback/noticias/${id}/`);
      message.success('Noticia eliminada exitosamente');
      setNews(prevNews => prevNews.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete news:', error);
      message.error('Error al eliminar la noticia');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditContent = (id) => {
    navigate(`/edit-content/${id}`);
  };

  const handleComment = (id) => {
    navigate(`/comments/${id}`);
  };

  const filteredNews = news.filter(record => 
    record.nombre_noticia.toLowerCase().includes(searchTerm.toLowerCase())
  );
  


  const columns = [
    { title: 'Titulo', dataIndex: 'nombre_noticia', key: 'nombre_noticia' },
    { 
      title: 'Autor', 
      key: 'autor',
      render: (text, record) => {
        const author = editors.find(editor => editor.id === record.autor);
        return author ? `${author.nombre} ${author.apellido}` : 'Unknown';
      }
    },
    { 
      title: 'Editor', 
      key: 'editor_en_jefe',
      render: (text, record) => {
        const editor = editors.find(editor => editor.id === record.editor_en_jefe);
        return editor ? `${editor.nombre} ${editor.apellido}` : 'Unknown';
      }
    },
    
    { title: 'Fecha de publicacion', dataIndex: 'fecha_publicacion', key: 'fecha_publicacion' },
    { 
      title: 'Sections', 
      key: 'secciones',
      render: (text, record) => {
        const secciones = [record.seccion1, record.seccion2, record.seccion3, record.seccion4, record.seccion5, record.seccion6].filter(Boolean);
        return secciones.join(', ');
      }
    },
    { title: 'Subscribers Only', dataIndex: 'solo_para_subscriptores', key: 'solo_para_subscriptores', render: (text) => text ? 'Yes' : 'No' },
    { 
      title: 'Status', 
      key: 'estado',
      render: (text, record) => {
        const status = publicationStates.find(state => state.id === record.estado);
        return status ? status.nombre_estado : 'Unknown';
      }
    },
    { title: 'Tags', dataIndex: 'tags', key: 'tags' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} style={{ marginRight: 8 }} />
          <Popconfirm
            title="Are you sure to delete this news?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger style={{ marginRight: 8 }} />
          </Popconfirm>
          <Button onClick={() => handleEditContent(record.id)} style={{ marginRight: 8 }}>Edit Content</Button>
          <Button icon={<CommentOutlined />} onClick={() => handleComment(record.id)}>Comment</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Input 
        placeholder="Buscar por nombre de noticia..." 
        value={searchTerm} 
        onChange={handleSearch} 
        style={{ marginBottom: 16 }} 
      />
      <Button icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Add News
      </Button>
      <Table columns={columns} dataSource={filteredNews} rowKey="id" />
      <Modal
        title={editingId ? "Edit News" : "Add News"}
        open={isModalVisible} // Cambia aquí de visible a open
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre_noticia" label="Title" rules={[{ required: true, message: 'Please input the title!' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="autor" label="Author" rules={[{ required: true, message: 'Please select an author!' }]}>
            <Select
              showSearch
              placeholder="Select an author"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {editors.map(editor => (
                <Option key={editor.id} value={editor.id}>{`${editor.nombre} ${editor.apellido}`}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="editor_en_jefe" label="Editor-in-Chief">
            <Select
              showSearch
              placeholder="Select an editor-in-chief"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {editors.map(editor => (
                <Option key={editor.id} value={editor.id}>{`${editor.nombre} ${editor.apellido}`}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="fecha_publicacion" label="Publication Date" rules={[{ required: true, message: 'Please select the publication date!' }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item name="secciones" label="Sections">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Select sections"
              maxTagCount={6}
            >
              {sectionOptions.map(section => (
                <Option key={section} value={section}>{section}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="solo_para_subscriptores" valuePropName="checked">
            <Checkbox>Subscribers Only</Checkbox>
          </Form.Item>

          <Form.Item name="estado" label="Status">
            <Select>
              {filteredPublicationStates.map(state => (
                <Option key={state.id} value={state.id}>{state.nombre_estado}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewsManagement;