import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import Paper from '@material-ui/core/Paper';
import './styles.scss';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  CustomPaging,
  IntegratedPaging,
} from '@devexpress/dx-react-grid';
import { Grid, Table, TableHeaderRow, PagingPanel } from '@devexpress/dx-react-grid-material-ui';
import { connect } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import dayjs from 'dayjs';
import SearchBar from 'material-ui-search-bar';
import ArchiveIcon from '@material-ui/icons/Archive';
import employeeProfileWebsocket from '../../websockets/employeeProfileWebsocket';
import { Checkbox } from '../shared/react-materialize';
import tableColors from '../shared/tableColors';
import { getCertificationDetails } from './actions/certificationDetails';
import { getCertifications, removeCertification } from './actions/certifications';
import Modal from '../shared/react-materialize/modal';
import Loading from '../shared/loading';
import Button from '../shared/react-materialize/button';
import ArchiveModal from './archiveModal';

/* eslint-disable max-lines-per-function */
const Certifications = ({
  certifications,
  employeeSummary,
  fetchCertifications,
  fetchCertificationDetails,
  certificationDetails,
  deleteCert,
}) => {
  const [deleteModal, setDeleteModal] = useState({ open: false, cert: null });
  const [isLoading, setIsLoading] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [deleteObjectivesBool, setDeleteObjectivesBool] = useState(false);
  const [destroyComment, setDestroyComment] = useState('');
  const [channel, setChannel] = useState(false);

  const deleteCertification = async () => {
    setIsLoading(true);
    await deleteCert(
      deleteModal.cert.id,
      deleteObjectivesBool,
      certificationDetails,
      employeeSummary.id,
      destroyComment
    );

    M.Modal.getInstance(document.querySelector('.modal.open')).close();
    setDeleteModal({ open: false, cert: null });
    setDeleteObjectivesBool(false);
    setDestroyComment('');
    setIsLoading(false);
  };

  useEffect(() => {
    const cert_ids = certifications.map(cert => cert.id);
    const { empty_certs, cert_id } = certIdForDetails(cert_ids);
    if (!empty_certs) {
      fetchCertificationDetails(employeeSummary.id, cert_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certifications.length]);

  useEffect(() => {
    const updateEmployeeProfile = data => {
      if (data.certification_ids.length !== 0) fetchCertifications(employeeSummary.id);
    };
    if (!channel) {
      employeeProfileWebsocket.listen(updateEmployeeProfile, setChannel);
    }
  }, [channel, setChannel, employeeSummary.id, fetchCertifications]);

  const certIdForDetails = cert_ids => {
    let empty_certs = false;
    let cert_id;

    if (employeeSummary.certification_id && cert_ids.indexOf(employeeSummary.certification_id) > -1) {
      cert_id = employeeSummary.certification_id;
    } else if (cert_ids.length > 0) {
      cert_id = cert_ids[0];
    } else {
      empty_certs = true;
    }

    return { empty_certs, cert_id };
  };

  const pageSize = 10;
  const totalCount = certifications.certificationsCount;
  const [columns, setColumns] = useState([
    {
      name: 'name',
      title: 'Name',
    },
    {
      name: 'status_human',
      title: 'Status',
    },
    {
      name: 'last_updated',
      title: 'Last Updated',
    },
    {
      name: 'expiration_date',
      title: 'Expires',
    },
    {
      name: 'eye_screen_result',
      title: 'Eye Screen Result',
    },
  ]);

  const [searchValue, setSearchState] = useState('');

  const tableHeaderStyles = () => ({
    headerCell: {
      background: '#4A4C74',
      color: '#FFFFFF',
      fontSize: '14px',
      borderBottom: 0,
      '& div': {
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      },
    },
    table: {
      padding: '0 10px 0 10px',
      borderSpacing: '0 20px',
    },
  });

  const boxShadow = '0 5px 0 0';

  const tableBodyStyles = {
    assigned: {
      backgroundColor: tableColors.profile_row_bg,
    },
    in_progress: {
      backgroundColor: tableColors.profile_row_bg,
      boxShadow: `${boxShadow} ${tableColors.in_progress_stripe}`,
    },
    active: {
      backgroundColor: tableColors.profile_row_bg,
      boxShadow: `${boxShadow} ${tableColors.active}`,
    },
    soon_to_expire: {
      backgroundColor: tableColors.profile_row_bg,
      boxShadow: `${boxShadow} ${tableColors.soon_to_expire}`,
    },
    expired: {
      backgroundColor: tableColors.profile_row_bg,
      boxShadow: `${boxShadow} ${tableColors.expired}`,
    },
  };
  return (
    <div>
      <Paper>
        <div
          style={{
            padding: '20px 0 0px 20px',
          }}
        >
          <h5>{'Certifications'}</h5>
        </div>

        <div
          style={{
            minHeight: '950px',
            maxHeight: '950px',
            overflowX: 'scroll',
          }}
        >
          <div
            style={{
              height: '70px',
              position: 'relative',
            }}
          >
            <SearchBar
              autoFocus
              style={{
                width: '50%',
                minWidth: '200px',
                marginLeft: 'auto',
                position: 'absolute',
                bottom: '-10px',
                right: '10px',
              }}
              value={searchValue}
              onChange={newValue => handleSearch(newValue)}
              onCancelSearch={() => setSearchState('')}
              name="search-bar"
            />
          </div>

          <Grid rows={certs()} columns={columns}>
            <SortingState />
            <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />

            <PagingState defaultCurrentPage={0} pageSize={pageSize} />
            <CustomPaging totalCount={totalCount} />

            <IntegratedPaging />
            <Table
              columnExtensions={[
                {
                  columnName: 'actions',
                  width: `${actionsColumnWidth === 0 ? 10 : actionsColumnWidth}px`,
                },
                {
                  columnName: 'eye_screen_result',
                  width: '115px',
                },
              ]}
              tableComponent={TableComponent}
              rowComponent={TableRow}
              cellComponent={TableCell}
            />

            <TableHeaderRow showSortingControls cellComponent={TableHeaderCellComponent} />

            <PagingPanel />
          </Grid>
        </div>
      </Paper>

      <Modal
        data-test="delete_modal"
        header={
          // eslint-disable-next-line react/jsx-wrap-multilines
          // By default Typography uses <p> for variant="body1"
          // This creates a console error as you cannot nest a <div> inside a <p>
          // So we can force component={'div'} or 'span' to properly nest this
          // Adding this comment as I do not want to make a customer facing change at this time
          // Reference https://stackoverflow.com/a/53494821
          <div>
            <div style={{ fontSize: '2rem' }}>{'Are you sure you want to delete the following certification:'}</div>
            <div style={{ marginTop: '10px', fontWeight: 300, fontSize: '1.75rem' }}>
              {deleteModal.cert && deleteModal.cert.name}
            </div>
            <Typography
              variant="body1"
              color="error"
              style={{
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: 'normal',
                marginTop: '10px',
              }}
            >
              <div>
                {
                  'Warning! This will delete all associated data with the selected entities, including the audit trail. If'
                }
                {' you have questions, please reach out to '}
                {
                  <a to="#" href="mailto:support@covalentnetworks.com">
                    {'support@covalentnetworks.com'}
                  </a>
                }
              </div>
            </Typography>
          </div>
        }
        options={{
          onCloseEnd: () => {
            setDeleteObjectivesBool(false);
            setDeleteModal({ open: false, cert: null });
          },
        }}
        open={deleteModal.open}
        actions={[
          <Button
            key={1}
            waves="green"
            modal="close"
            flat
            onClick={() => {
              setDeleteObjectivesBool(false);
              setDeleteModal({ open: false, cert: null });
              setDestroyComment('');
            }}
          >
            {'Close'}
          </Button>,
          <Button key={2} waves="green" modal="confirm" onClick={deleteCertification}>
            {'SUBMIT'}
          </Button>,
        ]}
      >
        <Loading isLoaded={!isLoading}>
          <div style={{ marginBottom: '30px' }}>
            {employeeSummary.show_cert_objectives_delete && (
              <div>
                <Checkbox
                  id="objectives_checkbox"
                  label="Delete Underlying Objectives"
                  type="checkbox"
                  name="objectives_on"
                  checked={deleteObjectivesBool}
                  onChange={() => setDeleteObjectivesBool(!deleteObjectivesBool)}
                />
                {deleteObjectivesBool && (
                  <span>
                    <ul>
                      {certificationDetails.certificationItems.sections.map(obj_section =>
                        obj_section.objectiveGroup.objectives.map(obj => <li key={obj.name}>{obj.name}</li>)
                      )}
                    </ul>
                  </span>
                )}
              </div>
            )}
          </div>
          <TextField
            id="discard-comment"
            inputProps={{
              style: { padding: '0px 10px' },
              maxLength: 140,
            }}
            helperText={`${destroyComment.length} / 140`}
            label="Comment"
            value={destroyComment}
            onChange={e => {
              setDestroyComment(e.target.value);
            }}
            variant="outlined"
            fullWidth
          />
        </Loading>
      </Modal>
      <ArchiveModal certification={archiveModal} archiveModal={archiveModal} setArchiveModal={setArchiveModal} />
    </div>
  );
};
/* eslint-enable max-lines-per-function */

Certifications.propTypes = {
  certifications: PropTypes.array.isRequired,
  fetchCertifications: PropTypes.func.isRequired,
  fetchCertificationDetails: PropTypes.func.isRequired,
  employeeSummary: PropTypes.object.isRequired,
  certificationDetails: PropTypes.object.isRequired,
  deleteCert: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { certifications, employeeSummary, certificationDetails } = state;

  return { certifications, employeeSummary, certificationDetails };
};

const mapDispatchToProps = dispatch => ({
  fetchCertificationDetails: (employeeId, certificationId) =>
    dispatch(getCertificationDetails(employeeId, certificationId)),
  fetchCertifications: employeeId => dispatch(getCertifications(employeeId)),
  deleteCert: (certId, deleteObjectivesBool, certificationDetails, employee_id, destroyComment) =>
    dispatch(removeCertification(certId, deleteObjectivesBool, certificationDetails, employee_id, destroyComment)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Certifications);