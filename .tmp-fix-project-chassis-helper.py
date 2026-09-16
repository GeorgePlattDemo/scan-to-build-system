from pathlib import Path

p = Path('.tmp-project-chassis-patch.py')
s = p.read_text()
old = '''s = replace_once(s, """      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: COPY.back,
      }),""", """      el('div', { className: 'actions project-navigation' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-workstreams' },
          text: COPY.backToWorkstreams,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-begin' },
          text: COPY.backToProjects,
        }),
      ]),""", 'page2 project nav')'''
new = '''page2_nav_old = """      el('button', {
        attrs: { type: 'button', 'data-action': 'back-to-begin' },
        text: COPY.back,
      }),"""
page2_nav_new = """      el('div', { className: 'actions project-navigation' }, [
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-workstreams' },
          text: COPY.backToWorkstreams,
        }),
        el('button', {
          attrs: { type: 'button', 'data-action': 'back-to-begin' },
          text: COPY.backToProjects,
        }),
      ]),"""
page2_start = s.index('export function page2Main(')
page2_end = s.index('export function page5Main(', page2_start)
page2_chunk = s[page2_start:page2_end]
page2_chunk = replace_once(page2_chunk, page2_nav_old, page2_nav_new, 'page2 project nav')
s = s[:page2_start] + page2_chunk + s[page2_end:]'''
assert s.count(old) == 1, s.count(old)
p.write_text(s.replace(old, new, 1))
