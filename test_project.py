import pytest
from datetime import datetime, timedelta
from project import format_time_info, format_matches, format_score, get_matches

TODAY = datetime.now().strftime('%Y-%m-%d')

def test_format_time_info_finished_today():
    fixture = {'date': datetime.now().isoformat(), 'status': {'long': "Match Finished", 'elapsed': 90}}
    result = format_time_info(fixture)
    assert "Match finished" in result

def test_format_time_info_running():
    fixture = {'date': (datetime.now() - timedelta(minutes=30)).isoformat(), 'status': {'long': "Not Finished"}}
    result = format_time_info(fixture)
    assert "Match ongoing for" in result

def test_format_time_info_finished_another_day():
    fixture = {'date': (datetime.now() - timedelta(days=1)).isoformat(), 'status': {'long': "Match Finished", 'elapsed': 90}}
    result = format_time_info(fixture)
    assert "Date:" in result

def test_format_score_finished():
    match = {'fixture': {'status': {'long': "Match Finished"}}}
    assert format_score(match) == "Finished"

def test_format_score_ongoing():
    match = {'fixture': {'status': {'long': "First Half"}}}
    assert format_score(match) == "?"

def test_format_matches():
    matches = [{
        'fixture': {'date': datetime.now().isoformat(), 'status': {'long': "Match Finished", 'elapsed': 90}},
        'league': {'name': "Premier League", 'country': "England"},
        'teams': {'home': {'name': "Team A"}, 'away': {'name': "Team B"}}
    }]
    result = format_matches(matches)
    assert "League: Premier League (England)" in result
    assert "Team A - Finished - Team B" in result

def test_format_matches_no_results():
    matches = [{
        'fixture': {'date': datetime.now().isoformat(), 'status': {'long': "Match Finished", 'elapsed': 90}},
        'league': {'name': "Non-Matching League", 'country': "Unknown Country"},
        'teams': {'home': {'name': "Team A"}, 'away': {'name': "Team B"}}
    }]
    result = format_matches(matches)
    assert result == ""

def test_get_matches():
    matches = get_matches(TODAY, "952583d14957b0616f3736e623fad301")
    assert isinstance(matches, list)
