;(function example() {
  'use strict'

  document.querySelector('#reset').addEventListener('click', function handleClick(event) {
    event.preventDefault()

    localStorage['_sr-prev'] = ''
    document.location.reload()
  })
}())
