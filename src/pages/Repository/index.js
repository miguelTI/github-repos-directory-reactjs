import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/container';
import {
  Loading,
  Owner,
  IssueList,
  IssueTypeButtons,
  IssuePaginator,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issuesType: 'all',
    issuesPage: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { issuesType, issuesPage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesType,
          page: issuesPage,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  getIssues = async () => {
    const { repository, issuesType, issuesPage } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: issuesType,
        page: issuesPage,
        per_page: 5,
      },
    });

    this.setState({
      issues: issues.data,
    });
  };

  handleIssueTypeChange = async e => {
    await this.setState({
      issuesPage: 1,
      issuesType: e.target.value,
    });

    this.getIssues();
  };

  handleIssuePageChange = async e => {
    await this.setState({
      issuesPage: e.target.value,
    });

    this.getIssues();
  };

  render() {
    const { loading, repository, issues, issuesType, issuesPage } = this.state;
    const firstPageDisabled = Number(issuesPage) === 1;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositorios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueTypeButtons>
          <button
            type="button"
            onClick={this.handleIssueTypeChange}
            value="all"
            disabled={issuesType === 'all'}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={this.handleIssueTypeChange}
            value="open"
            disabled={issuesType === 'open'}
          >
            Abertas
          </button>
          <button
            type="button"
            onClick={this.handleIssueTypeChange}
            value="closed"
            disabled={issuesType === 'closed'}
          >
            Fechadas
          </button>
        </IssueTypeButtons>

        <IssuePaginator>
          <button
            type="button"
            onClick={this.handleIssuePageChange}
            value={Number(issuesPage) - 1}
            disabled={firstPageDisabled}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={this.handleIssuePageChange}
            value={Number(issuesPage) + 1}
          >
            Próximo
          </button>
        </IssuePaginator>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
