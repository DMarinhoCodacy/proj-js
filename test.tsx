import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  Title,
  Button,
  IconAndText,
  Subheader,
  Paragraph,
  Link,
  useModal,
  Caption,
} from '@codacy/ui-components'

import Paywall from '../Paywall'
import PullRequestWidget from './PullRequestsWidget'
import LastUpdatedWidget from './LastUpdatedWidget'
import OverallQuality from './OverallQuality'
import { Page, EmptyState, SupportLink } from 'components'
import { OrganizationParams } from 'components/router/routes/organization'
import { ReactComponent as AddIcon } from 'ionicons/dist/ionicons/svg/add-outline.svg'
import { useParams } from 'react-router-dom'
import { RepositoryWithAnalysis } from '@codacy/api-typescript/lib/models'
import { AddRepositoryModal } from '../components/AddRepositoryModal'
import { SuggestedPeoplePanel } from '../components/SuggestedPeoplePanel'
import { useLocalStorage } from 'common'
import { useFeatureContext } from 'context/FeatureContext'
import { OrganizationOwnerContent } from '../components/OrganizationOwnerContent'
import { QualityFactorsType } from './OverallQuality/types'
import { ButtonProps } from '@codacy/ui-components/lib/Button/types'
import { DrillDownRepositoriesCard } from './DrillDownRepositoriesCard'
import { useOrganizationMemberContext } from 'context/OrganizationsContext'
import { useAnalytics } from 'thirdParty/analytics'
import { useReleaseTogglesContext } from 'context/ReleaseTogglesContext'
import { RepositoriesDropdown } from 'components/data'
import { useRepositoriesWithAnalysis } from 'context/RepositoriesContext'
import { docsLink } from 'common/docsLink'
import { useAPIContext } from 'context/ApiContext'
import { useUserContext } from 'context/UserContext'
import { BaseApiError } from '@codacy/api-typescript'
import AppConfiguration from 'configuration/AppConfiguration'
import { difference } from 'lodash'

const AddRepositoriesButton: React.FC<Pick<ButtonProps, 'onClick'>> = ({ onClick }) => (
  <Button btnType="primary" className="repositories-add-navigate" onClick={onClick}>
    <IconAndText icon={AddIcon} iconProps={{ scale: 1.25 }}>
      Add repository
    </IconAndText>
  </Button>
)

const TeamDashboard: React.FC = () => {
  const { organization, billing, paywall } = useOrganizationMemberContext()
  const { api } = useAPIContext()
  const { handleAuthedException } = useUserContext()
  const abortController = useMemo(() => new AbortController(), [])
  const addRepositoryModalProps = useModal('add-repository')
  const { trackTeamDashboard: track } = useAnalytics()

  const params = useParams<OrganizationParams>()

  const [showSuggestions, setShowSuggestions] = useLocalStorage(
    `codacy.organization[${organization.provider}/${organization.name}].overview.peopleSuggestions`,
    true
  )

  const [selectedRepositoriesNames, setSelectedRepositoriesNames] = useLocalStorage<string[]>(
    `codacy.organization[${organization.provider}/${organization.name}].overview.selectedRepositories`,
    []
  )

  // whenever a list of repositories is not given, use the context already loaded repositories for performance
  const { repositories, isFetching, isEmpty, isSinglePage, error } = useRepositoriesWithAnalysis({})
  const [repositoriesToFetch, setRepositoriesToFetch] = useState<string[]>([])
  const [failedRepositories, setFailedRepositories] = useState<string[]>([])
  const [repositoriesByNameDiff, setRepositoriesByNameDiff] = useState<RepositoryWithAnalysis[]>([])
  const [isFetchingByName, setIsFetchingByName] = useState(false)

  const [hasSuggestions, setHasSuggestions] = useState(true)
  const featuresMap = useFeatureContext()
  const { flags } = useReleaseTogglesContext()

  const [selectedBar, setSelectedBar] = useState<{ groupName: string; innerRepositories: RepositoryWithAnalysis[] }>()
  const [selectedFactor, setSelectedFactor] = useState<QualityFactorsType>('grade')

  const handleSuggestionsDismiss = useCallback(() => {
    setShowSuggestions(false)
  }, [setShowSuggestions])

  const handleSuggestionsLoad = useCallback((loading: boolean, showPanel: boolean) => {
    setHasSuggestions(loading || showPanel)
  }, [])

  const repositoriesToShow = useMemo(() => {
    const result = selectedRepositoriesNames?.length
      ? [
          ...repositoriesByNameDiff,
          ...repositories.filter((r) => selectedRepositoriesNames.includes(r.repository.name)),
        ]
      : repositories.slice(0, AppConfiguration.pagination.repositoriesLimit)

    return result.filter((repo) => !!repo.lastAnalysedCommit)
  }, [repositories, repositoriesByNameDiff, selectedRepositoriesNames])

  const fetchRepositoriesByName = useCallback(
    async (names: string[]) => {
      setIsFetchingByName(true)

      try {
        const { data } = await api.searchOrganizationRepositoriesWithAnalysisMethod(
          organization.provider,
          organization.name,
          {
            names,
          },
          {
            abortSignal: abortController.signal,
          }
        )

        // just in case, store failed to fetch repositories to avoid going into a loop
        // trying to get these forever
        const failed = difference(
          names,
          data.map((r) => r.repository.name)
        )
        if (failed.length > 0) {
          console.log(`Failed to fetch: ${failed.join(', ')}`)
          setFailedRepositories((prev) => [...prev, ...failed])
        }

        setRepositoriesByNameDiff(data)
      } catch (err) {
        handleAuthedException(err as BaseApiError)
      } finally {
        setIsFetchingByName(false)
      }
    },
    [abortController.signal, api, handleAuthedException, organization.name, organization.provider]
  )

  const loading = isFetching || isFetchingByName

  useEffect(() => {
    if (selectedRepositoriesNames?.length) {
      // check if we have all repositories already
      const notFoundNames = selectedRepositoriesNames.filter(
        (name) =>
          !repositories.some(({ repository }) => repository.name === name) &&
          !repositoriesByNameDiff.some(({ repository }) => repository.name === name) &&
          !failedRepositories.some((r) => r === name)
      )

      if (notFoundNames.length > 0) {
        setRepositoriesToFetch(notFoundNames)
      }
    }

    return () => abortController.abort()
  }, [abortController, repositories, selectedRepositoriesNames, repositoriesByNameDiff, failedRepositories])

  useEffect(() => {
    if (repositoriesToFetch.length > 0) {
      fetchRepositoriesByName(repositoriesToFetch)
      setRepositoriesToFetch([])
    }
  }, [fetchRepositoriesByName, repositoriesToFetch])

  const displaySuggestions =
    featuresMap.peopleSuggestions &&
    featuresMap.peopleAdding &&
    showSuggestions &&
    hasSuggestions &&
    billing?.isPremium &&
    organization.provider !== 'manual'

  const handleBarSelect = useCallback(
    (groupName?: string, innerRepositories?: RepositoryWithAnalysis[]) => {
      if (groupName && innerRepositories) {
        setSelectedBar({ groupName, innerRepositories })
        track('Selected chart bar', {
          barName: groupName,
          factor: selectedFactor,
          innerRepositoriesCount: innerRepositories.length,
        })
      } else {
        setSelectedBar(undefined)
        track('Unselected chart bar')
      }
    },
    [track, selectedFactor]
  )

  const handleFactorChange = useCallback(
    (factor: QualityFactorsType) => {
      setSelectedFactor(factor)
      track('Selected quality factor', { factor })
    },
    [track]
  )

  const handleRepositoriesChange = useCallback(
    (val: string[]) => {
      setSelectedRepositoriesNames(val)
      track('Selected repositories', { repositoriesCount: val.length })
    },
    [setSelectedRepositoriesNames, track]
  )

  return (
    <Page title={`${organization.name} dashboard`} category="organization.dashboard">
      {paywall?.organizationDashboard ? (
        <Paywall />
      ) : (
        <>
          {error && !isFetching && (
            <EmptyState height="90vh" maxWidth="750px">
              <Subheader mb={4}>An unexpected error happened</Subheader>
              <Paragraph as="div">
                There was a problem trying to fetch your organization information. Try again later and if the problem
                persists, <SupportLink>contact us on support</SupportLink>.
              </Paragraph>
            </EmptyState>
          )}
          {!error && !isFetching && isEmpty && (
            <EmptyState height="90vh" maxWidth="750px">
              <Subheader mb={4}>Seems like there are no commits or repositories to analyze yet</Subheader>
              <Paragraph mb={6} as="div">
                Once we have repositories with commits to analyze your code, you will see your team's dashboard with
                overall quality and pull requests that need attention.{' '}
                <Link href={docsLink('organizations/organization-overview')} isExternal size="md">
                  Learn more about it here
                </Link>
              </Paragraph>
              <AddRepositoriesButton onClick={addRepositoryModalProps.show} />
            </EmptyState>
          )}
          {(loading || (!error && repositoriesToShow.length > 0)) && (
            <Box p={6}>
              <Flex justifyContent="space-between" alignItems="baseline" mb={6}>
                <Title display="inline-block">{organization.name}</Title>
                <AddRepositoriesButton onClick={addRepositoryModalProps.show} />
              </Flex>
              {flags.pageNewOrganizationOverview && (
                <Flex mb={4} alignItems="center">
                  <Caption mr={3} size="md">
                    Quality of
                  </Caption>
                  <RepositoriesDropdown
                    total={selectedRepositoriesNames?.length || repositoriesToShow.length}
                    value={selectedRepositoriesNames || []}
                    onChange={handleRepositoriesChange}
                    disabled={loading}
                    loading={loading}
                  />
                </Flex>
              )}
              <Flex flexDirection="row" mx={-5}>
                <Box px={5} flexGrow={1}>
                  <OverallQuality
                    isFetching={loading && repositoriesToShow.length === 0}
                    repositories={repositoriesToShow}
                    onSelect={flags.featOverviewDrillDown ? handleBarSelect : undefined}
                    onFactorChange={handleFactorChange}
                    hasMoreRepositories={!selectedRepositoriesNames?.length && !isSinglePage}
                  />
                  <PullRequestWidget repositories={selectedRepositoriesNames} />
                </Box>
                <Box px={5} width={[1 / 3, '27.5rem']}>
                  {!!selectedBar && (
                    <DrillDownRepositoriesCard
                      height="30.125rem"
                      mb={8}
                      ml={-8}
                      pl={8}
                      factor={selectedFactor}
                      repositories={selectedBar.innerRepositories}
                      group={selectedBar.groupName}
                    />
                  )}

                  {displaySuggestions && !selectedBar && (
                    <OrganizationOwnerContent>
                      <SuggestedPeoplePanel
                        height="30rem"
                        mb={8}
                        onDismiss={handleSuggestionsDismiss}
                        onLoad={handleSuggestionsLoad}
                        provider={params.provider}
                        organization={params.organization}
                      />
                    </OrganizationOwnerContent>
                  )}

                  <LastUpdatedWidget
                    limit={displaySuggestions || !!selectedBar ? 7 : 14}
                    isFetching={loading}
                    repositories={repositories}
                  />
                </Box>
              </Flex>
            </Box>
          )}
          {addRepositoryModalProps.visible && <AddRepositoryModal modalProps={addRepositoryModalProps} />}
        </>
      )}
    </Page>
  )
}

export default TeamDashboard