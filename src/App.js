import React, { useState } from 'react';
import { Form, InputNumber, Popconfirm, Table, Typography, Button } from 'antd';
import SolutionB from './SolutionB';
import './App.css';

//a chaque fois miajoute nouvelle ligne de ny cellule voloan maka lettre alphabet ray atranatrany
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let currentLetterIndex = 0;

const EditableCell = ({
    editing,
    dataIndex,
    record,
    columns,
    children,
    ...restProps
}) => {

    
    if (!record || !record.key) {
        return (
            <td {...restProps} style={{ width: '2rem', height: '2rem', padding: '4px' }}>
                {children}
            </td>
        );
    }

   //ligne fixed farany "stck"
    const isFixedRow = record.key === 'fixed';
    //miselect le cellule farany am 2ème colonne farany ho lasa non editable 
    const isSecondLastColumn = dataIndex === columns[columns.length - 1].dataIndex;
    const isEditable = editing && !(isFixedRow && isSecondLastColumn);
    //
    //inputNumber type anle input anaty cellule raimanotolo nle tableau
    const inputNode = <InputNumber style={{ width: '2.5rem', height: '2rem' }} />;
    return (
        <td {...restProps} style={{ width: '2rem', height: '2rem', padding: '4px' }}>
            {isEditable ? (
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
    const [columns, setColumns] = useState([
        { title: '', dataIndex: 'letter', editable: false },
        { title: '1', dataIndex: '1', editable: true },
        { title: '2', dataIndex: '2', editable: true },
        { title: 'Dmd', dataIndex: 'demandeCapacity', editable: true },
    ]);

    //meme principe am le cellule mis alphabet fa nombre isak miajouter nouvelle colonne ndray de manomboka am tab[i]=3 no manisy anle nombre isak nouvelle colonne 
    const [nextNumber, setNextNumber] = useState(3);
    const [editingKey, setEditingKey] = useState('');
    //lié amle affichage via bouton tableau 
    const [showSolutionB, setShowSolutionB] = useState(false);

    
    //ligne stck farany
    const [fixedRow, setFixedRow] = useState({
        key: 'fixed',
        letter: 'Stck',
        demandeCapacity: 0,
        // Initialisation de toutes les colonnes à des valeurs vides
        ...columns.reduce((acc, col) => {
            if (col.editable) {
                acc[col.dataIndex] = ''; //valeurs vides
            }
            return acc;
        }, {}),
    });

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


    const save = async (key) => {
        try {
            // Valider les champs édités
            const row = await form.validateFields();
            console.log('Row validé:', row);
            
            if (key === 'fixed') {
                // Mettre à jour `fixedRow` avec les nouvelles valeurs
                const updatedFixedRow = { ...fixedRow, ...row };
                console.log('Ligne fixe mise à jour:', updatedFixedRow);
                
                // Mettre à jour `data` en remplaçant la ligne fixe avec les nouvelles valeurs
                const updatedData = data.map(item => {
                    if (item.key === 'fixed') {
                        return updatedFixedRow; // Remplace la ligne fixe existante par les nouvelles valeurs
                    }
                    return item; // Conserve les autres lignes
                });

                setData(updatedData);
                setFixedRow(updatedFixedRow); 
            } else {
                // Pour les autres lignes, mise à jour  ny `data` donnée globale no atao 
                const newData = [...data];
                const index = newData.findIndex((item) => item.key === key);
                if (index > -1) {
                    newData[index] = {
                        ...newData[index],
                        ...row,
                    };
                    setData(newData);
                }
            }

            // Réinitialiser `editingKey`
            setEditingKey(''); // reinitialisation à vide
        } catch (err) {
            console.log('Erreur lors de la validation:', err);
        }
    };

    //premiere ligne: ref tapitr n alaphabet =26 na tonga an am "Z" de ts afaka miajouter nouvelle ligne tsony
    const addRow = () => {
        if (currentLetterIndex >= alphabet.length) {
            alert('Vous avez atteint la fin de l\'alphabet.');
            return;
        }

        const newLetter = alphabet[currentLetterIndex];
        currentLetterIndex++;

        const newRow = {
            key: data.length + 1,
            letter: newLetter,
            demandeCapacity: 0, // valeur n colonne "Dmd" par defaut "0"
        };

        // Initialisation toutes les nouvelles colonnes ajoutées à des valeurs vides
        for (let i = 3; i <= columns.length; i++) {
            newRow[`col${i}`] = '';
        }

        setData([...data, newRow]);
        setEditingKey(newRow.key);
    };

    const addColumn = () => {
        const newColumn = {
            title: nextNumber.toString(),
            dataIndex: `col${nextNumber}`,
            editable: true,
        };

        // Ajout  nouvelle colonne reetra avant la colonne d'opération
        setColumns(prevColumns => [...prevColumns.slice(0, prevColumns.length - 1), newColumn, prevColumns[prevColumns.length - 1]]);

        // Mise à jour ny données reetra en global => "data"
        const updatedData = data.map(row => ({
            ...row,
            [`col${nextNumber}`]: '',
        }));

        setData(updatedData);
        setNextNumber(nextNumber + 1);
    };

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
                    <Popconfirm title="sûr ?" onConfirm={cancel}>
                        <Typography.Link>X</Typography.Link>
                    </Popconfirm>
                </span>
            ) : (
                <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                    Edit
                </Typography.Link>
            );
        },
        width: 50,
    };

    // Ajout ligne fixe à la fin de `data` zan oe an mafarany fona na firy na firy ny ligne vaovao ajouté
    const dataWithFixedRow = [...data, fixedRow];
   

    // Fusionner toutes les colonnes avec la colonne d'opération car ny declarena nitokana le colonne opération amzay izy afaka atao en dernier colonne fona izy 
    const mergedColumns = [...columns, operationColumn].map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
                inputType: col.dataIndex === 'number' ? 'number' : 'text',
            }),
        };
    });

    const displaySolutionB = () => {
        setShowSolutionB(true);
    };

    return (
        <div>
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
                            cell: (props) => <EditableCell {...props} columns={columns} />,
                        },
                    }}

                    
                    bordered
                    dataSource={dataWithFixedRow}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    pagination={false}
                    className='Table1'
                />
            </Form>

            <Button onClick={displaySolutionB} type="primary" style={{ marginTop: -1, left: '16.4rem' }}>
                Tableau
            </Button>

            {showSolutionB && (
                 <div id='tableau'>
                    <SolutionB data={data} fixedRow={fixedRow} columns={columns} />
                 </div>
            )}

        </div>
    );
   

};

export default App;
