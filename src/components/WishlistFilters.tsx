import {useEffect, useState, useRef} from 'react'
import {Badge, Button, Col, Container, Dropdown, Form, Row, Stack} from 'react-bootstrap'
import {ChevronDown, ChevronUp, Funnel, Gift, PersonHeart, X} from 'react-bootstrap-icons'
import {Filters} from "../interfaces/Filters";
import {useTranslation} from "react-i18next";
import '../assets/filters.css';


interface WishlistFiltersProps {
    handleFilterChange: (filters: Filters) => void;
    users: Array<string>;
}


export default function WishlistFilters({handleFilterChange, users}: WishlistFiltersProps) {
    const {t} = useTranslation();

    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [onlyTakenWishes, setOnlyTakenWishes] = useState(false)

    const filterRef = useRef<HTMLDivElement>(null)

    const updateFilters = () => {
        handleFilterChange({
            onlyTakenWishes: onlyTakenWishes,
            selectedUser: selectedUser
        })
    }

    const activeFiltersCount = (selectedUser ? 1 : 0) + (onlyTakenWishes ? 1 : 0)

    const resetFilters = () => {
        setSelectedUser('')
        setOnlyTakenWishes(false)
        handleFilterChange({selectedUser: '', onlyTakenWishes: false})
    }

    useEffect(() => {
        updateFilters();
        setIsOpen(false);
    }, [onlyTakenWishes, selectedUser]);

    useEffect(() => {
        // Handle a click outside the filters and close the window
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <Container fluid>
            <Row>
                <Col xs={12} className="d-flex justify-content-end">
                    <div className="position-relative">

                        <Button
                            variant="outline-success"
                            onClick={() => setIsOpen(!isOpen)}
                            className="d-flex align-items-center mt-2 me-2"
                        >
                            <Funnel size={22}></Funnel>
                            <span className={"ms-2"}>{t('WLFilters.filter')}</span>
                            {activeFiltersCount > 0 && (
                                <Badge bg="primary" className="ms-2 me-1">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                            {isOpen ? <ChevronUp className="ms-2"/> : <ChevronDown className="ms-2"/>}
                        </Button>

                        {isOpen && (
                            <div
                                ref={filterRef}
                                className="filters-content position-absolute end-0 mt-2 p-3 bg-white border rounded shadow-sm"
                            >
                                <Stack direction={"vertical"} gap={4}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="m-0">{t('WLFilters.filters')}</h6>
                                        <Button variant="link"
                                                className="p-0"
                                                onClick={() => setIsOpen(false)}
                                        >
                                            <X size={20}/>
                                        </Button>
                                    </div>
                                    <Dropdown onSelect={(e) => setSelectedUser(e || '')}>
                                        <Dropdown.Toggle variant="warning" id="dropdown-user" className="w-100">
                                            <PersonHeart className="me-2" size={18}/>
                                            {selectedUser ? users.find(user => user === selectedUser) : t('WLFilters.selectAUser')}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item eventKey="">{t('WLFilters.all')}</Dropdown.Item>
                                            {users.map((user) => (
                                                <Dropdown.Item key={user} eventKey={user}>
                                                    {user}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <Form.Check
                                        type="checkbox"
                                        id="takenWishes"
                                        label={
                                            <span>
                                                <Gift size={18} className="text-success mx-2 mx-md-1"/>
                                                {t('WLFilters.onlyTakenWishes')}
                                             </span>
                                        }
                                        checked={onlyTakenWishes}
                                        onChange={(e) => setOnlyTakenWishes(e.target.checked)}
                                    />

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="mt-2 col-9 align-self-end"
                                    >
                                        {t('WLFilters.resetAllFilters')}
                                    </Button>

                                </Stack>
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    )
}
