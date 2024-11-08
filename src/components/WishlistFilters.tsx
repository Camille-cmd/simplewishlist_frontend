import {useEffect, useState} from 'react'
import {Filters} from "../interfaces/Filters";
import { Funnel, Gift, PersonHeart} from "react-bootstrap-icons";
import Form from "react-bootstrap/Form";
import '../assets/filters.css';
import {Dropdown, Stack} from "react-bootstrap";
import {useTranslation} from "react-i18next";


interface WishlistFiltersProps {
    handleFilterChange: (filters: Filters) => void;
    users: Array<string>;
}

export default function WishlistFilters({handleFilterChange, users}: WishlistFiltersProps) {
    const {t} = useTranslation();

    const [onlyTakenWishes, setOnlyTakenWishes] = useState(false)
    const [selectedUser, setSelectedUser] = useState('')

    const [showFilters, setShowFilters] = useState(false)

    const updateFilters = () => {
        handleFilterChange({
            onlyTakenWishes: onlyTakenWishes,
            selectedUser: selectedUser
        })
    }

    useEffect(() => {
        updateFilters()
    }, [onlyTakenWishes, selectedUser]);


    return (
        <>
            <div className={"text-end mt-3 me-3"} onClick={()=>setShowFilters(!showFilters)}>
                <Funnel size={22}></Funnel>
                <span className={"ms-2"}>{t('WLFilters.filter')}</span>
            </div>

            {showFilters && (
                <div className="filters">

                    <Stack gap={3} className="mb-3 d-flex flex-md-row justify-content-center">
                        <Dropdown
                            onSelect={(e) => setSelectedUser(e || '')}
                            className={"users-dropdown col-md-6 col-lg-4"}
                        >
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
                            className={"col-md-6 d-flex align-items-center"}
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
                    </Stack>

                </div>
            )}
        </>
    )
}
