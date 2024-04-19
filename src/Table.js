import React, { useState } from 'react';
import { Form, InputNumber, Popconfirm, Table, Typography, Button } from 'antd';
import './App.css';

function Table1() {
//valeur premiere colonne 
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let currentLetterIndex = 0;

//cellules tableau 
const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = <InputNumber style={{ width: '2.5rem', height: '2rem' }} />
    return (
        <td {...restProps} style={{ width: '2rem', height: '2rem', padding: '4px' }}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};


const App = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    //header tableau 
    const [columns, setColumns] = useState([
        { title: '0', dataIndex: 'letter', width: '15%', editable: false },
        { title: '1', dataIndex: '1', width: '15%', editable: true },
        { title: '2', dataIndex: '2', width: '15%', editable: true },
    ]);
    const [nextNumber, setNextNumber] = useState(3); 
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    //Enregistrement apres edit 
    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                setData(newData);
                setEditingKey('');
            } else {
                newData.push(row);
                setData(newData);
                setEditingKey('');
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };
//Ajout ligne 
    const addRow = () => {
        if (currentLetterIndex >= alphabet.length) {
            alert('Vous avez atteint la fin de l\'alphabet.');
            return;
        }

        const newLetter = alphabet[currentLetterIndex];
        currentLetterIndex++;

        const newRowKey = (data.length + 1).toString();
        const newRow = {
            key: newRowKey,
            letter: newLetter,
        };

        setData([...data, newRow]);
        setEditingKey(newRowKey);
    };
//Ajout Colonne
    const addColumn = () => {
        const newColumn = {
            title: `${(columns.length -1) + 1}`,
            dataIndex: `title`,
            editable: true,
        };

        // Ajoute la nouvelle colonne
        setColumns([...columns, newColumn]);

        // Mets à jour les données
        const updatedData = data.map((row, index) => {
            if (index === 0) {
                // Ajoute `nextNumber` à la première ligne de la nouvelle colonne
                return {
                    ...row,
                    [`column${columns.length + 1}`]: nextNumber,
                };
            }
            // Autres lignes restent inchangées, initialisées à vide
            return {
                ...row,
                [`column${columns.length + 1}`]: '',
            };
        });

        setData(updatedData);
        setNextNumber(nextNumber + 1); // Augmente `nextNumber` de 1
    };

    //derniere colonne  "Editer + Save"
    const operationColumn = {
        title: '#',
        dataIndex: 'operation',
        render: (_, record) => {
            const editable = isEditing(record);
            return editable ? (
                <span>
                    <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
                        S
                    </Typography.Link>
                    <Popconfirm title="cancel?" onConfirm={cancel}>
                        <a>X</a>
                    </Popconfirm>
                </span>
            ) : (
                <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                    Edit
                </Typography.Link>
            );
        },
    };

    const mergedColumns = [...columns, operationColumn].map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.dataIndex === '2' ? 'number' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Form form={form} component={false}>
            <Button onClick={addRow} type="primary" style={{ marginBottom: 16, marginRight: 4 }}>
                + Row
            </Button>
            <Button onClick={addColumn} type="primary" style={{ marginBottom: 16 }}>
                + Col
            </Button>
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={data}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={false}
                style={{ width: '100px', height: '100px'}}
            />
        </Form>
    );
};
}

export default Table1;
